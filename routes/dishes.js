const express = require('express');
const router = express.Router();
const dishesController = require('../controllers/dishes');
const authController = require('../controllers/auth');

router.get('/showDishes',authController.verifyLoginUser, function(req, res,next) { 
     dishesController.showAll(req, res,next)
});

router.get('/submitDishes', authController.verifyLoginUser, function (req, res, next) {
    dishesController.renderCreateDishes(req, res, next);
});


router.post('/submittedDish',authController.verifyLoginUser, function(req, res,next) { 
     dishesController.createDish(req, res,next)
});

router.get('/deleteDish/:dishId',authController.verifyLoginUser, function(req, res,next) { 
     dishesController.deleteDish(req, res,next)
});

module.exports = router;