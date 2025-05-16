const mongoDish = require("../models/dish");
const axios = require("axios");
const mongoMenu = require("../models/menu");
const mongoRestaurant = require("../models/restaurant");
const logAction = require("../utils/logger");

let dishesController = {};

// Controlador para exibir todos os pratos
dishesController.showAll = async function (req, res, next) {
  try {
    const user = req.user;
    const { page = 1, limit = 6, name, minPrice, maxPrice, category, allergens } = req.query; // Parâmetros de filtro
    const skip = (page - 1) * limit;

    // Construir o filtro de busca
    let query = { isVisible: true }; // Apenas pratos visíveis por padrão

    // Admin pode ver todos os pratos, incluindo os ocultos
    if (user.role === "Admin") {
      delete query.isVisible; // Remove o filtro de visibilidade para Admin
    }

    // Filtrar por nome do prato
    if (name) {
      query.name = { $regex: name, $options: "i" }; // Busca por nome (case insensitive)
    }

    // Filtrar por faixa de preço
    if (minPrice || maxPrice) {
      query["prices.media"] = {}; // Considerando o preço médio como base
      if (minPrice) query["prices.media"].$gte = parseFloat(minPrice); // Preço mínimo
      if (maxPrice) query["prices.media"].$lte = parseFloat(maxPrice); // Preço máximo
    }

    // Filtrar por categoria
    if (category) {
      query.category = { $regex: category, $options: "i" }; // Busca por categoria (case insensitive)
    }

    // Filtrar por alérgenos
    if (allergens) {
      query.allergens = { $regex: allergens, $options: "i" }; // Busca por alérgenos (case insensitive)
    }

    // Buscar todos os pratos com paginação e aplicar os filtros
    const dishList = await mongoDish.find(query).skip(skip).limit(parseInt(limit));

    // Buscar todos os menus
    const menuList = await mongoMenu.find().populate("dishes");

    // Buscar todos os restaurantes
    const allRestaurants = await mongoRestaurant.find();

    // Associar menus e restaurantes aos pratos
    const dishesWithAssociations = dishList.map((dish) => {
      // Encontrar menus que incluem o prato
      const associatedMenus = menuList
        .filter((menu) => menu.dishes.some((menuDish) => menuDish.equals(dish._id)))
        .map((menu) => {
          // Encontrar restaurantes associados ao menu
          const associatedRestaurants = allRestaurants
            .filter((restaurant) => restaurant.menus.some((menuId) => menuId.equals(menu._id)))
            .map((restaurant) => ({
              name: restaurant.name,
              managerId: restaurant.managerId,
            }));

          return {
            _id: menu._id,
            menuName: menu.name,
            restaurants: associatedRestaurants.length > 0 ? associatedRestaurants : [], // Garante que seja um array vazio se não houver restaurantes
          };
        });

      return {
        ...dish.toObject(),
        associatedMenus: associatedMenus.length > 0 ? associatedMenus : [], // Garante que seja um array vazio se não houver menus
      };
    });

    // Garantir que os menus associados sejam exibidos mesmo sem restaurantes
    dishesWithAssociations.forEach((dish) => {
      dish.associatedMenus.forEach((menu) => {
        if (!menu.restaurants || menu.restaurants.length === 0) {
          menu.restaurants = [{ name: "No associated restaurant", managerId: null }];
        }
      });
    });

    // Filtrar pratos com base no papel do usuário
    const filteredDishes = dishesWithAssociations.filter((dish) => {
      if (user.role === "Admin") {
        // Admin pode ver todos os pratos
        return true;
      }

      if (user.role === "Manager") {
        // Manager só pode ver os pratos que ele criou
        return dish.managerId && dish.managerId.toString() === user._id.toString();
      }

      if (user.role === "Client") {
        // Client pode ver apenas pratos visíveis
        return dish.isVisible;
      }

      // Outros papéis (se houver) não podem ver pratos
      return false;
    });

    // Filtrar menus e restaurantes associados para managers
    if (user.role === "Manager") {
      filteredDishes.forEach((dish) => {
        dish.associatedMenus = dish.associatedMenus.filter((menu) => {
          // Filtrar menus que pertencem ao manager
          menu.restaurants = menu.restaurants.filter((restaurant) => {
            return restaurant.managerId.toString() === user._id.toString();
          });

          // Retornar apenas menus que ainda têm restaurantes associados
          return menu.restaurants.length > 0;
        });
      });
    }

    // Total de pratos para paginação
    const totalDishes = await mongoDish.countDocuments(query);
    const totalPages = Math.ceil(totalDishes / limit);

    // Renderizar a página com os pratos filtrados e paginação
    res.json({
      dishes: filteredDishes,
      user: user,
      currentPage: parseInt(page),
      totalPages,
      filters: { name, minPrice, maxPrice, category, allergens },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// Controlador para criar um prato
dishesController.createDish = async function (req, res, next) {
  try {
    const { name, description, category, ingredients, allergens, calories, fat, protein, carbs, nutriScore } = req.body;

    const dishPic = req.file ? req.file.filename : null;

    const prices = {
      pequena: parseFloat(req.body.price_pequena) || 0,
      media: parseFloat(req.body.price_media) || 0,
      grande: parseFloat(req.body.price_grande) || 0,
    };

    const user = req.user;

    // Verificar se a categoria já existe
    const existingCategories = await mongoDish.distinct("category");
    let finalCategory = category;

    if (!existingCategories.includes(category)) {
      // Adicionar a nova categoria se ela não existir
      finalCategory = category.trim();
    }

    // Chamada à API externa para obter informações nutricionais
    let nutritionData = {};
    try {
      const nutritionRes = await axios.get(
        "https://api.spoonacular.com/recipes/guessNutrition",
        {
          params: {
            title: name,
            apiKey: process.env.SPOONACULAR_API_KEY,
          },
          timeout: 5000, // Timeout para evitar problemas com a API
        }
      );
      nutritionData = nutritionRes.data;
    } catch (error) {
      console.error("Error fetching nutrition data:", error.message);
      // Valores padrão em caso de falha
      nutritionData = {
        calories: { value: parseFloat(calories) || 0 },
        fat: { value: parseFloat(fat) || 0 },
        protein: { value: parseFloat(protein) || 0 },
        carbs: { value: parseFloat(carbs) || 0 },
        nutritionGrade: nutriScore || "N/A",
      };
    }

    const finalCalories = nutritionData?.calories?.value || parseFloat(calories) || 0;
    const finalFat = nutritionData?.fat?.value || parseFloat(fat) || 0;
    const finalProtein = nutritionData?.protein?.value || parseFloat(protein) || 0;
    const finalCarbs = nutritionData?.carbs?.value || parseFloat(carbs) || 0;
    const finalNutriScore = nutritionData?.nutritionGrade || nutriScore || "N/A";

    // Verificar se ingredients é uma string antes de usar .split()
    const ingredientsList = Array.isArray(ingredients)
      ? ingredients
      : ingredients
      ? ingredients.split(",").map((el) => el.trim())
      : [];

    const allergensList = Array.isArray(allergens)
      ? allergens
      : allergens
      ? allergens.split(",").map((el) => el.trim())
      : [];

    const dishData = {
      name,
      description,
      category: finalCategory, // Usar a categoria final (nova ou existente)
      ingredients: ingredientsList,
      prices,
      nutrition: {
        calories: finalCalories,
        fat: finalFat,
        protein: finalProtein,
        carbs: finalCarbs,
      },
      nutriScore: finalNutriScore,
      allergens: allergensList,
      managerId: user._id,
      dishPic: dishPic,
    };

    const newDish = await mongoDish.create(dishData);

    logAction("Created Dish", user, { dishId: newDish._id, name });

    res.json({ message: "Dish created successfully", dishId: newDish._id });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

dishesController.renderCreateDishes = async function (req, res, next) {
  try {
    // Categorias predefinidas
    const predefinedCategories = ['Meat', 'Vegetarian', 'Vegan', 'Dessert'];

    // Combinar categorias predefinidas com as existentes, removendo duplicatas
    const categories = Array.from(new Set([...predefinedCategories]));

    // jsonizar a página com as categorias
    res.json({
      user: req.user, // Passa o usuário logado para o EJS
      categories, // Passa as categorias combinadas para o EJS
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    next(error);
  }
};

dishesController.showDish = async function (req, res, next) {
  try {
    const user = req.user;

    // Buscar o prato pelo ID
    const dish = await mongoDish.findById(req.params.dishId);
    if (!dish) {
      return res.status(404).json("errors/404", { message: "Dish not found." });
    }

    // Verificar permissões
    if (
      user.role !== "Admin" && // Apenas Admin pode acessar qualquer prato
      (!dish.managerId || dish.managerId.toString() !== user._id.toString()) // Gerente só pode acessar seus próprios pratos
    ) {
      return res.status(403).json("errors/403", { message: "Access denied." });
    }

    // Buscar todos os menus
    const menuList = await mongoMenu.find().populate("dishes");

    // Buscar todos os restaurantes
    const allRestaurants = await mongoRestaurant.find();

    // Encontrar menus associados ao prato
    const associatedMenus = menuList
      .filter((menu) => menu.dishes.some((menuDish) => menuDish.equals(dish._id)))
      .map((menu) => {
        // Encontrar restaurantes associados ao menu
        const associatedRestaurants = allRestaurants
          .filter((restaurant) => restaurant.menus.some((menuId) => menuId.equals(menu._id)))
          .map((restaurant) => ({
            name: restaurant.name,
            managerId: restaurant.managerId,
          }));

        return {
          _id: menu._id,
          menuName: menu.name,
          restaurants: associatedRestaurants.length > 0 ? associatedRestaurants : [], // Garante que seja um array vazio se não houver restaurantes
        };
      });

    // Filtrar menus e restaurantes associados para managers
    if (user.role === "Manager") {
      associatedMenus.forEach((menu) => {
        menu.restaurants = menu.restaurants.filter((restaurant) => {
          return restaurant.managerId.toString() === user._id.toString();
        });
      });
    }

    // jsonizar a página com os detalhes do prato
    res.json({
      dish: {
        ...dish.toObject(),
        associatedMenus,
      },
      user: user,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

dishesController.deleteDish = function (req, res, next) {
  const user = req.user;

  mongoDish
    .findById(req.params.dishId)
    .then((dish) => {
      if (!dish) return res.status(404).send("Plate not found.");

      if (
        user.role !== "Admin" &&
        dish.managerId.toString() !== user._id.toString()
      ) {
        return res
          .status(403)
          .send("You don´t have permission do delete this plate.");
      }

      return mongoDish.findByIdAndDelete(req.params.dishId).then(() => {
        logAction("Deleted Dish", user, { dishId: dish._id, name: dish.name });
      });
    })
    .then(() => res.json({ message: "Dish deleted successfully" }))
    .catch(next);
};

dishesController.renderEditDish = function (req, res, next) {
  mongoDish
    .findById(req.params.dishId)
    .then(async (dish) => {
      if (!dish) return res.status(404).json("errors/404", { message: "Dish not found." });

      const user = req.user;

      // Verificar permissões
      if (
        user.role !== "Admin" &&
        (!dish.managerId || dish.managerId.toString() !== user._id.toString())
      ) {
        return res.status(403).json("errors/403", { message: "Access denied." });
      }

      // Buscar categorias existentes
       // Categorias predefinidas
    const predefinedCategories = ['Meat', 'Vegetarian', 'Vegan', 'Dessert'];

    // Combinar categorias predefinidas com as existentes, removendo duplicatas
    const categories = Array.from(new Set([...predefinedCategories]));


      // jsonizar a página de edição com as categorias
      res.json({ dish, user, categories });
    })
    .catch(next);
};


dishesController.updateDish = function (req, res, next) {
  const dishId = req.params.dishId;
  const {
    name,
    description,
    category,
    ingredients,
    calories,
    fat,
    protein,
    carbs,
    nutriScore,
    allergens,
  } = req.body;

  const prices = {
    pequena: parseFloat(req.body.price_pequena) || 0,
    media: parseFloat(req.body.price_media) || 0,
    grande: parseFloat(req.body.price_grande) || 0,
  };

  mongoDish
    .findById(dishId)
    .then((dish) => {
      if (!dish) {
        return res.status(404).send("Dish not found.");
      }

      const user = req.user;

      // Verificar permissões
      if (
        user.role !== "Admin" &&
        (!dish.managerId || dish.managerId.toString() !== user._id.toString())
      ) {
        return res
          .status(403)
          .send("You do not have permission to edit this dish.");
      }

      const updatedDishData = {
        name,
        description,
        category,
        ingredients: Array.isArray(ingredients)
          ? ingredients
          : ingredients
          ? ingredients.split(",").map((el) => el.trim())
          : dish.ingredients || [],
        prices,
        nutrition: {
          calories: parseFloat(calories) || dish.nutrition.calories,
          fat: parseFloat(fat) || dish.nutrition.fat,
          protein: parseFloat(protein) || dish.nutrition.protein,
          carbs: parseFloat(carbs) || dish.nutrition.carbs,
        },
        nutriScore: nutriScore || dish.nutriScore || "N/A",
        allergens: Array.isArray(allergens)
          ? allergens
          : allergens
          ? allergens.split(",").map((el) => el.trim())
          : dish.allergens || [],
      };

      if (req.file) {
        updatedDishData.dishPic = req.file.filename;
      }

      return mongoDish.findByIdAndUpdate(dishId, updatedDishData, { new: true });
    })
    .then((updatedDish) => {
      // Registrar log
      logAction("Updated Dish", req.user, { dishId: updatedDish._id, name: updatedDish.name });

      res.json({ message: "Dish updated successfully", dishId: updatedDish._id });
    })
    .catch(next);
};

dishesController.toggleVisibility = async function (req, res, next) {
  try {
    const dishId = req.params.dishId;
    const user = req.user;

    // Verificar se o usuário está autenticado
    if (!user) {
      return res.status(401).send("You must be logged in to perform this action.");
    }

    // Buscar o prato pelo ID
    const dish = await mongoDish.findById(dishId);
    if (!dish) {
      return res.status(404).send("Dish not found.");
    }

    // Verificar permissões
    if (
      user.role !== "Admin" &&
      (!dish.managerId || dish.managerId.toString() !== user._id.toString())
    ) {
      return res.status(403).send("You do not have permission to modify this dish.");
    }

    // Alternar visibilidade usando updateOne para evitar validação completa
    await mongoDish.updateOne({ _id: dishId }, { $set: { isVisible: !dish.isVisible } });

    // Registrar log
    logAction(dish.isVisible ? "Dish Shown" : "Dish Hidden", user, { dishId: dish._id, name: dish.name });

    // Redirecionar para a página de pratos
    res.json({ message: "Dish visibility toggled successfully" });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// Adicionar uma nova categoria
dishesController.addCategory = async function (req, res, next) {
  try {
    const { category } = req.body;

    if (!category || category.trim() === "") {
      return res.status(400).send("Category name cannot be empty.");
    }

    // Verificar se a categoria já existe
    const existingCategories = await mongoDish.distinct("category");
    if (existingCategories.includes(category)) {
      return res.status(400).send("Category already exists.");
    }

    // Adicionar a nova categoria (não diretamente no banco, mas como referência)
    res.status(200).send({ success: true, message: "Category added successfully." });
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).send("Internal server error.");
  }
};

module.exports = dishesController;
