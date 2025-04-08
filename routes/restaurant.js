var express = require('express');
var router = express.Router();
const restaurantsController = require('../controllers/restaurants')
const authController = require('../controllers/auth')


router.get('/showRestaurant/:name', authController.verifyLoginUser, function(req, res,next) {
    restaurantsController.showDetails(req, res,next)
});

router.get('/submitRestaurant', authController.verifyLoginUser, function(req, res, next) {
    restaurantsController.renderCreateRestaurant(req, res, next);
});

router.post('/submittedRestaurant', authController.verifyLoginUser, function(req, res, next) {
    restaurantsController.createRestaurant(req, res, next);
});

router.get('/showRestaurants', authController.verifyLoginUser, function(req, res,next){
    restaurantsController.showAll(req,res,next)
})

router.post('/deleteRestaurant/:name', authController.verifyLoginUser, function(req, res, next) {
    restaurantsController.deleteRestaurant(req, res, next)
})

router.get('/editRestaurant/:name', authController.verifyLoginUser, function(req, res, next) {
    restaurantsController.renderEditRestaurant(req, res, next);
});

router.post('/editRestaurant/:name', authController.verifyLoginUser, function(req, res, next) {
    restaurantsController.updateRestaurant(req, res, next);
});

router.get('/pendingApproval', authController.verifyLoginUser, restaurantsController.showPendingRestaurants);

router.post('/approveRestaurant/:id', authController.verifyLoginUser, restaurantsController.approveRestaurant);

module.exports = router;