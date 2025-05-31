const express = require("express");
const router = express.Router();
const dishesController = require("../controllers/dishes");
const authController = require("../controllers/auth");
const upload = require("../middlewares/upload");

// Rota para exibir todos os pratos
router.get("/showDishes", authController.attachUserIfExists, function (req, res, next) {   
    dishesController.showAll(req, res, next);
});

// Rota para exibir o formulário de criação de pratos
router.get("/submitDishes", authController.verifyLoginUser, function (req, res, next) {
    dishesController.renderCreateDishes(req, res, next);
});

// Rota para exibir os detalhes de um prato específico
router.get("/showDish/:dishId", authController.verifyLoginUser, function (req, res, next) {
    dishesController.showDish(req, res, next);
});

// Rota para processar o formulário de criação de pratos, incluindo upload de imagem
router.post("/submittedDish", upload.single("dishPic"), authController.verifyLoginUser, function (req, res, next) {
    dishesController.createDish(req, res, next);
});

// Rota para deletar um prato específico pelo ID
router.delete("/deleteDish/:dishId", authController.verifyLoginUser, function (req, res, next) {
    dishesController.deleteDish(req, res, next);
});

// Rota para exibir o formulário de edição de um prato específico
router.get("/editDish/:dishId", authController.verifyLoginUser, function (req, res, next) {
    dishesController.renderEditDish(req, res, next);
});

// Rota para processar o formulário de edição de pratos, incluindo upload de imagem
router.put("/editDish/:dishId", upload.single("dishPic"), authController.verifyLoginUser, function (req, res, next) {
    dishesController.updateDish(req, res, next);
});

// Rota para alternar a visibilidade de um prato (ex.: visível/invisível)
router.patch("/toggleVisibility/:dishId", authController.verifyLoginUser, dishesController.toggleVisibility);

// Rota para exibir o formulário de criação de categorias
router.post('/addCategory', dishesController.addCategory);

module.exports = router; // Exporta o roteador para ser usado em outros arquivos
