const mongoMenu = require('../models/menu');
const mongoRestaurant = require('../models/restaurant');
const mongoDish = require('../models/dish');

let menusController = {};

menusController.renderCreateMenu = async function (req, res, next) {
    try {
        const restaurants = await mongoRestaurant.find({ managerId: req.user._id }); // Restaurantes do manager
        const dishes = await mongoDish.find(); // Todos os pratos
        res.render('menus/submitMenu', { restaurants, dishes });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

// Mostrar todos os menus de um restaurante
menusController.showAll = function (req, res, next) {
    const managerId = req.user._id;
    mongoRestaurant.find({ managerId })
        .then(function (restaurants) {
            const restaurantIds = restaurants.map(r => r._id); // IDs dos restaurantes do manager
            return mongoMenu.find({ restaurantId: { $in: restaurantIds } }).populate('restaurantId');
        })
        .then(function (menuList) {
            const inputs = {
                menus: menuList
            };
            res.render('menus/showMenus', inputs);
        })
        .catch(function (err) {
            next(err);
        });
};

// Criar um menu
menusController.createMenu = function (req, res, next) {
    const { name, restaurantId, dishes } = req.body;

    const menuData = {
        name,
        restaurantId,
        dishes: Array.isArray(dishes) ? dishes : [dishes]
    };

    mongoMenu.create(menuData)
        .then(function () {
            res.redirect('/menus/showMenus');
        })
        .catch(function (err) {
            next(err);
        });
};

// Deletar um menu
menusController.deleteMenu = function (req, res, next) {
    const managerId = req.user._id;

    // Verifica se o menu pertence a um restaurante do manager
    mongoRestaurant.findOne({ _id: req.params.restaurantId, managerId })
        .then(function (restaurant) {
            if (!restaurant) {
                return res.status(404).send('Menu não encontrado ou você não tem permissão para apagá-lo.');
            }
            return mongoMenu.findOneAndDelete({ _id: req.params.menuId });
        })
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

module.exports = menusController;