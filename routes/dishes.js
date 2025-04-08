const express = require("express");
const router = express.Router();
const dishesController = require("../controllers/dishes");
const authController = require("../controllers/auth");

router.get("/showDishes", authController.verifyLoginUser,function (req, res, next) {
    dishesController.showAll(req, res, next);
  });

router.get("/submitDishes", authController.verifyLoginUser,function (req, res, next) {
    dishesController.renderCreateDishes(req, res, next);
  });

router.get("/showDish/:dishId", authController.verifyLoginUser, function (req, res, next) {
    dishesController.showDish(req, res, next);
  });

router.post("/submittedDish", authController.verifyLoginUser,function (req, res, next) {
    dishesController.createDish(req, res, next);
  });

router.post("/deleteDish/:dishId",authController.verifyLoginUser, function (req, res, next) {
    dishesController.deleteDish(req, res, next);
  });

router.get("/editDish/:dishId", authController.verifyLoginUser, function (req, res, next) {
    dishesController.renderEditDish(req, res, next);
  });

router.post("/editDish/:dishId", authController.verifyLoginUser, function (req, res, next) {
    dishesController.updateDish(req, res, next);
  });

module.exports = router;
