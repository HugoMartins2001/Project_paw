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
    const { page = 1, limit = 6, name, minPrice, maxPrice, category, allergens } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (user && user.role === "Admin") {
    } else if (user && user.role === "Manager") {
      query.managerId = user._id;
    } else {
      query.isVisible = true;
    }

    if (name) {
      query.name = { $regex: name, $options: "i" };
    }

    if (minPrice || maxPrice) {
      query["prices.media"] = {};
      if (minPrice) query["prices.media"].$gte = parseFloat(minPrice);
      if (maxPrice) query["prices.media"].$lte = parseFloat(maxPrice);
    }

    if (category) {
      query.category = { $regex: category, $options: "i" };
    }

    if (allergens) {
      query.allergens = { $regex: allergens, $options: "i" };
    }

    const dishList = await mongoDish.find(query).skip(skip).limit(parseInt(limit));

    const menuList = await mongoMenu.find().populate("dishes");

    const allRestaurants = await mongoRestaurant.find();

    const dishesWithAssociations = dishList.map((dish) => {
      const associatedMenus = menuList
        .filter((menu) => menu.dishes.some((menuDish) => menuDish.equals(dish._id)))
        .map((menu) => {
          const associatedRestaurants = allRestaurants
            .filter((restaurant) => restaurant.menus.some((menuId) => menuId.equals(menu._id)))
            .map((restaurant) => ({
              name: restaurant.name,
              managerId: restaurant.managerId,
            }));

          return {
            _id: menu._id,
            menuName: menu.name,
            restaurants: associatedRestaurants.length > 0 ? associatedRestaurants : [],
          };
        });

      return {
        ...dish.toObject(),
        associatedMenus: associatedMenus.length > 0 ? associatedMenus : [],
      };
    });

    dishesWithAssociations.forEach((dish) => {
      dish.associatedMenus.forEach((menu) => {
        if (!menu.restaurants || menu.restaurants.length === 0) {
          menu.restaurants = [{ name: "No associated restaurant", managerId: null }];
        }
      });
    });

    const filteredDishes = dishesWithAssociations.filter((dish) => {
      if (!user) {
        return dish.isVisible;
      }
      if (user.role === "Admin") return true;
      if (user.role === "Manager") return dish.managerId && dish.managerId.toString() === user._id.toString();
      if (user.role === "Client") return dish.isVisible;
      return false;
    });

    if (user && user.role === "Manager") {
      filteredDishes.forEach((dish) => {
        dish.associatedMenus = dish.associatedMenus.filter((menu) => {
          menu.restaurants = menu.restaurants.filter((restaurant) => {
            return restaurant.managerId && restaurant.managerId.toString() === user._id.toString();
          });
          return menu.restaurants.length > 0;
        });
      });
    }

    const totalDishes = await mongoDish.countDocuments(query);
    const totalPages = Math.ceil(totalDishes / limit);

    res.json({
      dishes: filteredDishes,
      user: user || null,
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

    if (req.body.prices && typeof req.body.prices === 'string') {
      try { req.body.prices = JSON.parse(req.body.prices); } catch { req.body.prices = { pequena: 0, media: 0, grande: 0 }; }
    }
    if (req.body.nutrition && typeof req.body.nutrition === 'string') {
      try { req.body.nutrition = JSON.parse(req.body.nutrition); } catch { req.body.nutrition = { calories: 0, fat: 0, protein: 0, carbs: 0 }; }
    }

    const { name, description, category, ingredients, allergens, nutriScore } = req.body;
    const nutrition = req.body.nutrition || {};
    const calories = nutrition.calories;
    const fat = nutrition.fat;
    const protein = nutrition.protein;
    const carbs = nutrition.carbs;

    const dishPic = req.file ? req.file.filename : null;
    const prices = req.body.prices || { pequena: 0, media: 0, grande: 0 };
    const nutrition1 = req.body.nutrition || { calories: 0, fat: 0, protein: 0, carbs: 0 };

    const user = req.user;

    const existingCategories = await mongoDish.distinct("category");
    let finalCategory = category;

    if (!existingCategories.includes(category)) {
      finalCategory = category.trim();
    }

    let nutritionData = {};
    if (
      !calories || !fat || !protein || !carbs
    ) {
      try {
        const nutritionRes = await axios.get(
          "https://api.spoonacular.com/recipes/guessNutrition",
          {
            params: {
              title: name,
              apiKey: process.env.SPOONACULAR_API_KEY,
            },
            timeout: 5000,
          }
        );
        nutritionData = nutritionRes.data;
      } catch (error) {
        console.error("Error fetching nutrition data:", error.message);
        nutritionData = {
          calories: { value: 0 },
          fat: { value: 0 },
          protein: { value: 0 },
          carbs: { value: 0 },
          nutritionGrade: nutriScore || "N/A",
        };
      }
    } else {
      nutritionData = {
        calories: { value: parseFloat(calories) || 0 },
        fat: { value: parseFloat(fat) || 0 },
        protein: { value: parseFloat(protein) || 0 },
        carbs: { value: parseFloat(carbs) || 0 },
        nutritionGrade: nutriScore || "N/A",
      };
    }

    const finalCalories = nutritionData?.calories?.value || 0;
    const finalFat = nutritionData?.fat?.value || 0;
    const finalProtein = nutritionData?.protein?.value || 0;
    const finalCarbs = nutritionData?.carbs?.value || 0;
    const finalNutriScore = nutritionData?.nutritionGrade || nutriScore || "N/A";

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
      category: finalCategory, 
      ingredients: ingredientsList,
      prices,
      nutrition: {
        calories: finalCalories,
        fat: finalFat,
        protein: finalProtein,
        carbs: finalCarbs,
      },
      nutrition1,
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
    const predefinedCategories = ['Meat', 'Vegetarian', 'Vegan', 'Dessert'];

    const categories = Array.from(new Set([...predefinedCategories]));

    res.json({
      user: req.user, 
      categories, 
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    next(error);
  }
};

dishesController.showDish = async function (req, res, next) {
  try {
    const user = req.user;

    const dish = await mongoDish.findById(req.params.dishId);
    if (!dish) {
      return res.status(404).json({ message: "Dish not found." });
    }

    // Permissões:
    // - Admin pode ver tudo
    // - Manager só vê os seus
    // - Client só vê pratos visíveis
    if (
      user.role === "Manager" &&
      (!dish.managerId || dish.managerId.toString() !== user._id.toString())
    ) {
      return res.status(403).json({ message: "Access denied." });
    }
    if (
      user.role === "Client" &&
      dish.isVisible !== true
    ) {
      return res.status(403).json({ message: "Access denied." });
    }

    const menuList = await mongoMenu.find().populate("dishes");

    const allRestaurants = await mongoRestaurant.find();

    const associatedMenus = menuList
      .filter((menu) => menu.dishes.some((menuDish) => menuDish.equals(dish._id)))
      .map((menu) => {
        const associatedRestaurants = allRestaurants
          .filter((restaurant) => restaurant.menus.some((menuId) => menuId.equals(menu._id)))
          .map((restaurant) => ({
            name: restaurant.name,
            managerId: restaurant.managerId,
          }));

        return {
          _id: menu._id,
          menuName: menu.name,
          restaurants: associatedRestaurants.length > 0 ? associatedRestaurants : [],
        };
      });

    if (user.role === "Manager") {
      associatedMenus.forEach((menu) => {
        menu.restaurants = menu.restaurants.filter((restaurant) => {
          return restaurant.managerId && restaurant.managerId.toString() === user._id.toString();
        });
      });
    }

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

      if (
        user.role !== "Admin" &&
        (!dish.managerId || dish.managerId.toString() !== user._id.toString())
      ) {
        return res.status(403).json("errors/403", { message: "Access denied." });
      }


      const predefinedCategories = ['Meat', 'Vegetarian', 'Vegan', 'Dessert'];

      const categories = Array.from(new Set([...predefinedCategories]));


      res.json({ dish, user, categories });
    })
    .catch(next);
};


dishesController.updateDish = function (req, res, next) {
  const dishId = req.params.dishId;

  if (req.body.prices && typeof req.body.prices === 'string') {
    try { req.body.prices = JSON.parse(req.body.prices); } catch { req.body.prices = { pequena: 0, media: 0, grande: 0 }; }
  }
  if (req.body.nutrition && typeof req.body.nutrition === 'string') {
    try { req.body.nutrition = JSON.parse(req.body.nutrition); } catch { req.body.nutrition = { calories: 0, fat: 0, protein: 0, carbs: 0 }; }
  }

  const {
    name, description, category, ingredients, nutriScore, allergens
  } = req.body;
  const prices = req.body.prices || { pequena: 0, media: 0, grande: 0 };
  const nutrition = req.body.nutrition || { calories: 0, fat: 0, protein: 0, carbs: 0 };

  mongoDish
    .findById(dishId)
    .then((dish) => {
      if (!dish) return res.status(404).json({ message: "Dish not found." });
      const user = req.user;
      if (user.role !== "Admin" && (!dish.managerId || dish.managerId.toString() !== user._id.toString())) {
        return res.status(403).json({ message: "You do not have permission to edit this dish." });
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
        nutrition,
        nutriScore: nutriScore || dish.nutriScore || "N/A",
        allergens: Array.isArray(allergens)
          ? allergens
          : allergens
            ? allergens.split(",").map((el) => el.trim())
            : dish.allergens || [],
      };
      if (req.file) updatedDishData.dishPic = req.file.filename;
      return mongoDish.findByIdAndUpdate(dishId, updatedDishData, { new: true });
    })
    .then((updatedDish) => {
      logAction("Updated Dish", req.user, { dishId: updatedDish._id, name: updatedDish.name });
      res.json({ message: "Dish updated successfully", dishId: updatedDish._id });
    })
    .catch(next);
};

dishesController.toggleVisibility = async function (req, res, next) {
  try {
    const dishId = req.params.dishId;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "You must be logged in to perform this action." });
    }

    const dish = await mongoDish.findById(dishId);
    if (!dish) {
      return res.status(404).json({ message: "Dish not found." });
    }

    if (
      user.role !== "Admin" &&
      (!dish.managerId || dish.managerId.toString() !== user._id.toString())
    ) {
      return res.status(403).json({ message: "You do not have permission to modify this dish." });
    }

    const newVisibility = !dish.isVisible;
    await mongoDish.updateOne({ _id: dishId }, { $set: { isVisible: newVisibility } });

    logAction(newVisibility ? "Dish Shown" : "Dish Hidden", user, { dishId: dish._id, name: dish.name });

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
      return res.status(400).json({ message: "Category name cannot be empty." });
    }

    const existingCategories = await mongoDish.distinct("category");
    if (existingCategories.includes(category)) {
      return res.status(400).json({ message: "Category already exists." });
    }

    res.status(200).json({ success: true, message: "Category added successfully." });
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = dishesController;
