const mongoMenu = require('../models/menu');
const mongoDish = require('../models/dish');
const mongoRestaurant = require('../models/restaurant'); 

let menusController = {};

// Renderizar a página de criação de menu
menusController.renderCreateMenu = async function (req, res, next) {
    try {
        const dishes = await mongoDish.find(); // Todos os pratos disponíveis
        res.render('menus/submitMenu', { dishes });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

// Mostrar todos os menus disponíveis
menusController.showAll = function (req, res, next) {
    mongoMenu.find()
        .populate('dishes')
        .then(function (menuList) {
            res.render('menus/showMenus', {
                menus: menuList,
                user: req.user 
            });
        })
        .catch(function (err) {
            next(err);
        });
};


// Criar um menu
menusController.createMenu = function (req, res, next) {
    const { name, dishes } = req.body;

    console.log(dishes);

    if( dishes.length === 0 ){
        return res.status(400).send('Selecione pelo menos um prato para o menu.');
    }

    const menuData = {
        name,
        dishes: Array.isArray(dishes) ? dishes : [dishes] // Garante que `dishes` seja um array
    };

    mongoMenu.create(menuData)
        .then(function () {
            res.redirect('/menus/showMenus');
        })
        .catch(function (err) {
            next(err);
        });
};

// Mostrar detalhes de um menu específico
menusController.showMenu = function (req, res, next) {
    const menuId = req.params.menuId;

    mongoMenu.findById(menuId)
        .populate('dishes')
        .then(function (menu) {
            if (!menu) {
                return res.status(404).send('Menu não encontrado.');
            }
            res.render('menus/showMenu', { menu });
        })
        .catch(function (err) {
            next(err);
        });
};


menusController.deleteMenu = function (req, res, next) {
    mongoMenu.findByIdAndDelete(req.params.menuId)
        .then(function (deletedMenu) {
            if (!deletedMenu) {
                return res.status(404).send('Menu não encontrado.');
            }
            res.redirect('/menus/showMenus');
        })
        .catch(function (err) {
            next(err);
        });
};

menusController.renderEditMenu = async function(req, res, next) {
    try {
        const menu = await mongoMenu.findById(req.params.menuId).populate('dishes').populate('restaurant');
        const allDishes = await mongoDish.find();
        const restaurants = await mongoRestaurant.find();  

        if (!menu) {
            return res.status(404).send('Menu não encontrado.');
        }

        res.render('menus/editMenu', { menu, dishes: allDishes, restaurants });
    } catch (err) {
        next(err);
    }
};

menusController.updateMenu = function(req, res, next) {
    const menuId = req.params.menuId;
    const updatedData = {
        name: req.body.name,
        dishes: Array.isArray(req.body.dishes) ? req.body.dishes : [req.body.dishes],
        restaurant: req.body.restaurant  
    };

    mongoMenu.findByIdAndUpdate(menuId, updatedData, { new: true, runValidators: true })
        .then(function(updated) {
            if (!updated) {
                return res.status(404).send('Menu não encontrado.');
            }
            res.redirect('/menus/showMenus');
        })
        .catch(function(err) {
            next(err);
        });
};



module.exports = menusController;
