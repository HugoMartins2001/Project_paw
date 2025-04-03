const mongoose = require('mongoose')
const mongoRestaurant = require('../models/restaurant')

let restaurantsController = {}

restaurantsController.showAll = function(req,res,next){  
    const managerId = req.user._id;
    mongoRestaurant.find({managerId})
        .then(function(restaurantList){
            const inputs = {
                restaurants:restaurantList
            }
            res.render('restaurants/showRestaurants', inputs)
        })
        .catch(function(err){
            next(err)
        })
}

restaurantsController.showDetails = function(req,res,next){
    const managerId = req.user._id;
    mongoRestaurant.findOne({name:req.params.name, managerId})
        .then(function(restaurantDB){
            const inputs = {
                restaurant:restaurantDB
            }
            res.render('restaurants/showRestaurant', inputs)
        })
        .catch(function(err){
            next(err)
        })
}

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

module.exports = restaurantsController;