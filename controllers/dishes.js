const mongoose = require('mongoose');
const mongoDish = require('../models/dish');

let dishesController = {};


dishesController.showAll = function (req, res, next) {
    const user = req.user; // Acesso ao usuário logado (o gerente ou admin)

    mongoDish.find()
        .then(function (dishList) {
            // Filtra os pratos com base no gerente logado
            const filteredDishes = dishList.filter(dish => {
                if (!dish.managerId) {
                    // Se não houver managerId, ignore o prato
                    return false;
                }

                // Se for admin, ele pode ver todos os pratos
                if (user.role === 'admin') {
                    return true;
                }

                // Se for manager, ele só vê os pratos que ele criou
                if (user.role === 'manager' && dish.managerId.toString() === user._id.toString()) {
                    return true;
                }

                return false;
            });

            res.render('dishes/showDishes', {
                dishes: filteredDishes,
                user: user
            });
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
        const user = req.user; // Acesso ao usuário logado (o gerente)

        const dishData = {
            name,
            description,
            price,
            category,
            ingredients: Array.isArray(ingredients) ? ingredients : [ingredients], 
            image,
            managerId: user._id // Associando o prato ao gerente logado
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
    const user = req.user; // Acesso ao usuário logado (o gerente)

    mongoDish.findById(req.params.dishId)
        .then(function (dish) {
            if (!dish) {
                return res.status(404).send('Prato não encontrado.');
            }

            // Verifica se o prato foi criado pelo gerente logado
            if (dish.managerId.toString() !== user._id.toString()) {
                return res.status(403).send('Você não tem permissão para excluir este prato.');
            }

            return mongoDish.findByIdAndDelete(req.params.dishId);
        })
        .then(function () {
            res.redirect('/dishes/showDishes');
        })
        .catch(function (err) {
            next(err);
        });
};


dishesController.renderEditDish = function (req, res, next) {
    const dishId = req.params.dishId;

    mongoDish.findById(dishId)
        .then(function (dish) {
            if (!dish) {
                return res.status(404).send('Prato não encontrado.');
            }
            res.render('dishes/editDish', { dish });
        })
        .catch(function (err) {
            next(err);
        });
};

dishesController.updateDish = function (req, res, next) {
    const dishId = req.params.dishId;
    const { name, description, price, category, ingredients, image } = req.body;

    const updatedDishData = {
        name,
        description,
        price,
        category,
        ingredients: Array.isArray(ingredients) ? ingredients : [ingredients],
        image
    };

    mongoDish.findByIdAndUpdate(dishId, updatedDishData, { new: true })
        .then(function (updatedDish) {
            res.redirect('/dishes/showDishes');
        })
        .catch(function (err) {
            next(err);
        });
};

module.exports = dishesController;