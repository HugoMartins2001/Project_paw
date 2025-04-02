const mongoose = require('mongoose')
const mongoRestaurant = require('../models/restaurant')

let restaurantsController = {}

restaurantsController.showAll = function(req,res,next){  
    mongoRestaurant.find({})
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
    mongoRestaurant.findOne({name:req.params.name})
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
    console.log(req.body);
    mongoRestaurant.create(req.body)
        .then(function(){
            res.redirect('/restaurants/showRestaurants')
        })
        .catch(function(err){
            next(err)
        })
}

restaurantsController.deleteCar = function(req,res,next){
    mongoRestaurant.findOneAndDelete({name:req.params.carName})
        .then(function(deleteRestaurant){
            res.redirect('/restaurants/showRestaurants')
        })
        .catch(function(err){
            next(err)
        })
}

module.exports = restaurantsController;