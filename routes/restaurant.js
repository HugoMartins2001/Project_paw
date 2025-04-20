var express = require("express");
var router = express.Router();
const restaurantsController = require("../controllers/restaurants");
const authController = require("../controllers/auth");
const upload = require("../middlewares/upload");

router.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

router.get("/showRestaurant/:name", authController.verifyLoginUser,function (req, res, next) {
    restaurantsController.showDetails(req, res, next);
  });

router.get("/submitRestaurant", authController.verifyLoginUser, function (req, res, next) {
    restaurantsController.renderCreateRestaurant(req, res, next);
  });

router.post("/submittedRestaurant",upload.single("restaurantPic"), authController.verifyLoginUser, function (req, res, next) {
    restaurantsController.createRestaurant(req, res, next);
  });

router.get("/showRestaurants", authController.verifyLoginUser, function (req, res, next) {
    restaurantsController.showAll(req, res, next);
  });

router.post("/deleteRestaurant/:id", authController.verifyLoginUser, function (req, res, next) {
    restaurantsController.deleteRestaurant(req, res, next);
  });

router.get("/editRestaurant/:id", authController.verifyLoginUser, function (req, res, next) {
    restaurantsController.renderEditRestaurant(req, res, next);
  });

router.post("/editRestaurant/:id", upload.single("restaurantPic"), authController.verifyLoginUser, function (req, res, next) {
    restaurantsController.updateRestaurant(req, res, next);
  });

router.get("/pendingApproval", authController.verifyLoginUser,
  restaurantsController.showPendingRestaurants
);

router.post("/approveRestaurant/:id", authController.verifyLoginUser,
  restaurantsController.approveRestaurant
);

module.exports = router;
