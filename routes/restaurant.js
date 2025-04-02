var express = require('express');
var router = express.Router();
const restaurantsController = require('../controllers/restaurants')
const authController = require('../controllers/auth')


router.get('/showRestaurant/:name', authController.verifyLoginUser, function(req, res,next) {
    restaurantsController.showDetails(req, res,next)
});

router.get('/submitRestaurant', authController.verifyLoginUser, function(req, res,next){
    res.render('restaurants/submitRestaurant')
})

router.post('/submittedRestaurant', authController.verifyLoginUser, function(req, res, next) {
    restaurantsController.createRestaurant(req, res, next);
});

router.get('/showRestaurants', authController.verifyLoginUser, function(req, res,next){
    restaurantsController.showAll(req,res,next)
})

router.get('/deleteCar/:carName', authController.verifyLoginUser, function(req, res){
    restaurantsController.deleteCar(req, res)
})



module.exports = router;