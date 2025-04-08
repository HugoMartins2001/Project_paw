var express = require("express");
var router = express.Router();
const authController = require("../controllers/auth");

router.get("/", function (req, res) {
  res.render("home/home");
});

router.get("/auth/login", authController.login);

router.get("/auth/register", authController.createLogin);

module.exports = router;
