const mongoDish = require("../models/dish");
const axios = require("axios");
const mongoMenu = require("../models/menu");
const mongoRestaurant = require("../models/restaurant");
const logAction = require("../utils/logger");



let dishesController = {};

dishesController.showAll = async function (req, res, next) {
  try {
    const user = req.user;
    const { page = 1, limit = 6 } = req.query; // Página atual e limite de itens por página
    const skip = (page - 1) * limit;

    // Buscar todos os pratos com paginação
    const dishList = await mongoDish.find().skip(skip).limit(parseInt(limit));

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
            .filter((restaurant) => restaurant.menus.includes(menu._id))
            .map((restaurant) => ({
              name: restaurant.name,
              managerId: restaurant.managerId,
            }));

          return {
            menuName: menu.name,
            restaurants: associatedRestaurants,
          };
        });

      return {
        ...dish.toObject(),
        associatedMenus,
      };
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
    const totalDishes = await mongoDish.countDocuments();
    const totalPages = Math.ceil(totalDishes / limit);

    // Renderizar a página com os pratos filtrados e paginação
    res.render("dishes/showDishes", {
      dishes: filteredDishes,
      user: user,
      currentPage: parseInt(page),
      totalPages,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

dishesController.renderCreateDishes = function (req, res, next) {
  try {
    res.render("dishes/submitDishes", {
      user: req.user, // Passa o usuário logado para o EJS
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

dishesController.createDish = async function (req, res, next) {
  try {
    const { name, description, category, ingredients, allergens } = req.body;

    const prices = {
      pequena: req.body["prices[pequena]"] || 0,
      media: req.body["prices[media]"] || 0,
      grande: req.body["prices[grande]"] || 0,
    };

    const user = req.user;

    const nutritionRes = await axios.get(
      "https://api.spoonacular.com/recipes/guessNutrition",
      {
        params: {
          title: name,
          apiKey: process.env.SPOONACULAR_API_KEY,
        },
      }
    );

    const nutritionData = nutritionRes.data;

    const calories = nutritionData?.calories?.value || 0;
    const fat = nutritionData?.fat?.value || 0;
    const protein = nutritionData?.protein?.value || 0;
    const carbs = nutritionData?.carbs?.value || 0;

    // Verificar se ingredients é uma string antes de usar .split()
    const ingredientsList = Array.isArray(ingredients)
      ? ingredients // Se já for um array, use diretamente
      : ingredients
      ? ingredients.split(",").map((el) => el.trim()) // Se for string, divida e limpe
      : []; // Caso contrário, use um array vazio

    const allergensList = Array.isArray(allergens)
      ? allergens // Se já for um array, use diretamente
      : allergens
      ? allergens.split(",").map((el) => el.trim()) // Se for string, divida e limpe
      : []; // Caso contrário, use um array vazio

    const dishData = {
      name,
      description,
      category,
      ingredients: ingredientsList,
      prices: prices,
      nutrition: {
        calories,
        fat,
        protein,
        carbs,
      },
      nutriScore: nutritionData?.nutritionGrade || "N/A",
      allergens: allergensList,
      managerId: user._id,
    };

    const newDish = await mongoDish.create(dishData);

    logAction("Created Dish", user, { dishId: newDish._id, name });

    
    res.redirect("/dishes/showDishes");
  } catch (error) {
    console.error(error);
    next(error);
  }
};

dishesController.showDish = async function (req, res, next) {
  try {
    const user = req.user;

    // Buscar o prato pelo ID
    const dish = await mongoDish.findById(req.params.dishId);
    if (!dish) {
      return res.status(404).render("errors/404", { message: "Dish not found." });
    }

    // Verificar permissões
    if (
      user.role !== "Admin" && // Apenas Admin pode acessar qualquer prato
      (!dish.managerId || dish.managerId.toString() !== user._id.toString()) // Gerente só pode acessar seus próprios pratos
    ) {
      return res.status(403).render("errors/403", { message: "Access denied." });
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
          .filter((restaurant) => restaurant.menus.includes(menu._id))
          .map((restaurant) => ({
            name: restaurant.name,
            managerId: restaurant.managerId,
          }));

        return {
          _id: menu._id, // Certifique-se de incluir o ID do menu
          menuName: menu.name,
          restaurants: associatedRestaurants,
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

    // Renderizar a página com os detalhes do prato
    res.render("dishes/showDish", {
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
    .then(() => res.redirect("/dishes/showDishes"))
    .catch(next);
};

dishesController.renderEditDish = function (req, res, next) {
  mongoDish
    .findById(req.params.dishId)
    .then((dish) => {
      if (!dish) return res.status(404).render("errors/404", { message: "Restaurant not found." });

      const user = req.user;

      // Verificar permissões
      if (
        user.role !== "Admin" &&
        (!dish.managerId || dish.managerId.toString() !== user._id.toString())
      ) {
        return res.status(403).render("errors/403", { message: "Access denied." });
      }

      res.render("dishes/editDish", { dish, user });
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
    pequena: req.body["prices[pequena]"] || 0,
    media: req.body["prices[media]"] || 0,
    grande: req.body["prices[grande]"] || 0,
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
        prices: prices,
        nutrition: {
          calories: calories || dish.nutrition.calories,
          fat: fat || dish.nutrition.fat,
          protein: protein || dish.nutrition.protein,
          carbs: carbs || dish.nutrition.carbs,
        },
        nutriScore: nutriScore || dish.nutriScore || "N/A",
        allergens: Array.isArray(allergens)
          ? allergens
          : allergens
          ? allergens.split(",").map((el) => el.trim())
          : dish.allergens || [],
      };

      return mongoDish.findByIdAndUpdate(dishId, updatedDishData, { new: true });
    })
    .then((updatedDish) => {
      // Registrar log
      logAction("Updated Dish", req.user, { dishId: updatedDish._id, name: updatedDish.name });

      res.redirect("/dishes/showDishes");
    })
    .catch(next);
};

module.exports = dishesController;
