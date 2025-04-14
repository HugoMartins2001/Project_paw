const express = require("express");
const router = express.Router();
const menusController = require("../controllers/menus");
const authController = require("../controllers/auth");
const upload = require("../middlewares/upload");

router.get("/showMenus", authController.verifyLoginUser, function (req, res, next) {
    menusController.showAll(req, res, next);
  });

router.get("/submitMenu", authController.verifyLoginUser, function (req, res, next) {
    menusController.renderCreateMenu(req, res, next);
  });

router.get( "/showMenu/:menuId", authController.verifyLoginUser, function (req, res, next) {
    menusController.showMenu(req, res, next);
  });

router.post("/submittedMenu", authController.verifyLoginUser, upload.single('menuPic'),function (req, res, next) {
    menusController.createMenu(req, res, next);
  });

router.post("/deleteMenu/:menuId", authController.verifyLoginUser, function (req, res, next) {
    menusController.deleteMenu(req, res, next);
  });

router.get("/editMenu/:menuId", authController.verifyLoginUser, function (req, res, next) {
    menusController.renderEditMenu(req, res, next);
  });

router.post("/editMenu/:menuId", authController.verifyLoginUser, upload.single("menuPic"), function (req, res, next) {
    menusController.updateMenu(req, res, next);
  });

module.exports = router;
