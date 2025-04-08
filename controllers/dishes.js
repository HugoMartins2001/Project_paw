const mongoDish = require("../models/dish");
const axios = require("axios");

let dishesController = {};

dishesController.showAll = function (req, res, next) {
  const user = req.user;

  mongoDish
    .find()
    .then(function (dishList) {
      const filteredDishes = dishList.filter((dish) => {
        if (!dish.managerId) return false;
        if (user.role === "admin") return true;
        if (
          user.role === "manager" &&
          dish.managerId.toString() === user._id.toString()
        )
          return true;
        return false;
      });

      res.render("dishes/showDishes", {
        dishes: filteredDishes,
        user: user,
      });
    })
    .catch(next);
};

dishesController.renderCreateDishes = function (req, res, next) {
  try {
    res.render("dishes/submitDishes");
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

    console.log(nutritionRes.data);

    const nutritionData = nutritionRes.data;

    const calories = nutritionData?.calories?.value || 0;
    const fat = nutritionData?.fat?.value || 0;
    const protein = nutritionData?.protein?.value || 0;
    const carbs = nutritionData?.carbs?.value || 0;

    const allergensList = allergens
      ? allergens.split(",").map((el) => el.trim())
      : [];

    const dishData = {
      name,
      description,
      category,
      ingredients: ingredients.split(",").map((el) => el.trim()),
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

    await mongoDish.create(dishData);
    res.redirect("/dishes/showDishes");
  } catch (error) {
    console.error(error);
    next(error);
  }
};

dishesController.showDish = function (req, res, next) {
  mongoDish
    .findById(req.params.dishId)
    .then((dish) => {
      if (!dish) return res.status(404).send("Plate not found.");
      res.render("dishes/showDish", { dish });
    })
    .catch(next);
};

dishesController.deleteDish = function (req, res, next) {
  const user = req.user;

  mongoDish
    .findById(req.params.dishId)
    .then((dish) => {
      if (!dish) return res.status(404).send("Plate not found.");

      if (
        user.role !== "admin" &&
        dish.managerId.toString() !== user._id.toString()
      ) {
        return res
          .status(403)
          .send("You don´t have permission do delete this plate.");
      }

      return mongoDish.findByIdAndDelete(req.params.dishId);
    })
    .then(() => res.redirect("/dishes/showDishes"))
    .catch(next);
};

dishesController.renderEditDish = function (req, res, next) {
  mongoDish
    .findById(req.params.dishId)
    .then((dish) => {
      if (!dish) return res.status(404).send("Plate not found.");
      res.render("dishes/editDish", { dish });
    })
    .catch(next);
};

dishesController.updateDish = function (req, res, next) {
  const dishId = req.params.dishId;
  const { name, description, category, ingredients, calories, fat, protein, carbs, nutriScore, allergens, } = req.body;

  const prices = {
    pequena: req.body["prices[pequena]"] || 0,
    media: req.body["prices[media]"] || 0,
    grande: req.body["prices[grande]"] || 0,
  };

  mongoDish
    .findById(dishId)
    .then((dish) => {
      const updatedDishData = {
        name,
        description,
        category,
        ingredients: Array.isArray(ingredients)
          ? ingredients
          : ingredients.split(",").map((el) => el.trim()),
        prices: prices,
        nutrition: {
          calories: calories || dish.nutrition.calories,
          fat: fat || dish.nutrition.fat,
          protein: protein || dish.nutrition.protein,
          carbs: carbs || dish.nutrition.carbs,
        },
        nutriScore: nutriScore || dish.nutriScore || "N/A",
        allergens: allergens
          ? allergens.split(",").map((el) => el.trim())
          : dish.allergens || [],
      };

      mongoDish
        .findByIdAndUpdate(dishId, updatedDishData, { new: true })
        .then(() => res.redirect("/dishes/showDishes"))
        .catch(next);
    })
    .catch(next);
};

module.exports = dishesController;
