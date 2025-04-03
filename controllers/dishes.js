const mongoose = require('mongoose');
const mongoDish = require('../models/dish');

let dishesController = {};


dishesController.showAll = function (req, res, next) {
    mongoDish.find()
        .then(function (dishList) {
            const inputs = {
                dishes: dishList
            };
            res.render('dishes/showDishes', inputs);
        })
        .catch(function (err) {
            next(err);
        });
};


dishesController.renderCreateDishes = function (req, res, next) {
    try {
        res.render('dishes/submitDishes'); 
    } catch (error) {
        console.error(error);
        next(error);
    }
};


dishesController.createDish = async function (req, res, next) {
    try {
        const { name, description, price, category, ingredients, image } = req.body;

        const dishData = {
            name,
            description,
            price,
            category,
            ingredients: Array.isArray(ingredients) ? ingredients : [ingredients], 
            image
        };

        await mongoDish.create(dishData);
        res.redirect('/dishes/showDishes');
    } catch (error) {
        console.error(error);
        next(error);
    }
};

dishesController.showDish = function (req, res, next) {
    const dishId = req.params.dishId;

    mongoDish.findById(dishId)
        .then(function (dish) {
            if (!dish) {
                return res.status(404).send('Prato não encontrado.');
            }
            res.render('dishes/showDish', { dish });
        })
        .catch(function (err) {
            next(err);
        });
};


dishesController.deleteDish = function (req, res, next) {
    mongoDish.findOneAndDelete({ _id: req.params.dishId })
        .then(function (deletedDish) {
            if (!deletedDish) {
                return res.status(404).send('Prato não encontrado.');
            }
            res.redirect('/dishes/showDishes');
        })
        .catch(function (err) {
            next(err);
        });
};

module.exports = dishesController;