const mongoose = require('mongoose')
const mongoRestaurant = require('../models/restaurant')
const mongoMenu = require('../models/menu')

let restaurantsController = {}

restaurantsController.renderCreateRestaurant = async function (req, res, next) {
    try {
        const menus = await mongoMenu.find(); // Todos os pratos
        res.render('restaurants/submitRestaurant', { menus });
    } catch (error) {
        console.error(error);
        next(error);
    }
};


restaurantsController.showAll = function(req, res, next) {
    if (!req.user) {
        return res.redirect('/auth/login');
    }

    const query = req.user.role === 'manager'
        ? { managerId: req.user._id }
        : {};

    mongoRestaurant.find(query)
        .then(function(restaurantList) {
            const inputs = {
                restaurants: restaurantList,
                user: req.user
            };
            res.render('restaurants/showRestaurants', inputs);
        })
        .catch(function(err) {
            next(err);
        });
};


restaurantsController.showDetails = function(req, res, next) {

    const query = req.user.role === 'manager' 
    ? { name: req.params.name, managerId: req.user._id } 
    : { name: req.params.name };

        mongoRestaurant.findOne(query)
        .populate('menus') 
        .then(function(restaurantDB) {
            if (!restaurantDB) {
                return res.render('restaurants/showRestaurant', { restaurant: null });
            }

            const inputs = {
                restaurant: restaurantDB
            };

            res.render('restaurants/showRestaurant', inputs);
        })
        .catch(function(err) {
            next(err);
        });
};


restaurantsController.createRestaurant = function(req,res,next){
    const managerId = req.user._id; 
    const restaurantData = { ...req.body, managerId }; 

    mongoRestaurant.create(restaurantData)
        .then(function(){
            res.redirect('/restaurants/showRestaurants')
        })
        .catch(function(err){
            next(err)
        })
}

restaurantsController.deleteRestaurant = function(req,res,next){
    const managerId = req.user._id; 
    mongoRestaurant.findOneAndDelete({name: req.params.name, managerId})
        .then(function(deletedRestaurant){
            if (!deletedRestaurant) {
                return res.status(404).send('Restaurante não encontrado ou você não tem permissão para o apagar.');
            }
            res.redirect('/restaurants/showRestaurants')
        })
        .catch(function(err){
            next(err)
        })
}

restaurantsController.renderEditRestaurant = function(req, res, next) {
    const query = req.user.role === 'manager'
        ? { name: req.params.name, managerId: req.user._id }
        : { name: req.params.name };

    // Recuperar todos os menus
    mongoMenu.find()
        .then(function(menus) {
            return mongoRestaurant.findOne(query)
                .then(function(restaurant) {
                    if (!restaurant) {
                        return res.status(404).send('Restaurante não encontrado ou sem permissão.');
                    }
                    // Renderizar a página com o restaurante e os menus
                    res.render('restaurants/editRestaurant', { restaurant, menus });
                });
        })
        .catch(function(err) {
            next(err);
        });
};


restaurantsController.updateRestaurant = function(req, res, next) {
    const managerId = req.user._id;
    const query = { name: req.params.name, managerId };

    const updatedData = {
        name: req.body.name,
        address: req.body.address,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        phone: req.body.phone,
        email: req.body.email,
        openingHours: req.body.openingHours,
        paymentMethods: req.body.paymentMethods,
        menus: req.body.menus || []  // Adiciona os menus selecionados no formulário
    };

    mongoRestaurant.findOneAndUpdate(query, updatedData, { new: true, runValidators: true })
        .then(function(updated) {
            if (!updated) {
                return res.status(404).send('Restaurante não encontrado ou sem permissão.');
            }
            res.redirect('/restaurants/showRestaurants');
        })
        .catch(function(err) {
            next(err);
        });
};



module.exports = restaurantsController;