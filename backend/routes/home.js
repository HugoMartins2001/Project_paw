var express = require("express");
var router = express.Router();
const authController = require("../controllers/auth");

// Rota para exibir a página inicial
router.get("/", function (req, res) {
  res.json("home/home");
});

// Rota para exibir a página de login
router.get("/auth/login", authController.login);

// Rota para exibir a página de registro
router.get("/auth/register", authController.createLogin);

module.exports = router; 
