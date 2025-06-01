const express = require("express");
const router = express.Router();
const menusController = require("../controllers/menus");
const authController = require("../controllers/auth");
const upload = require("../middlewares/upload");

// Rota para exibir todos os menus
router.get("/showMenus", authController.attachUserIfExists, function (req, res, next) {
    menusController.showAll(req, res, next);
});

// Rota para exibir o formulário de criação de menus
router.get("/submitMenu", authController.verifyLoginUser, function (req, res, next) {
    menusController.renderCreateMenu(req, res, next);
});

// Rota para exibir os detalhes de um menu específico
router.get("/showMenu/:menuId", authController.verifyLoginUser, function (req, res, next) {
    menusController.showMenu(req, res, next);
});

// Rota para processar o formulário de criação de menus, incluindo upload de imagem
router.post("/submittedMenu", authController.verifyLoginUser, upload.single('menuPic'), function (req, res, next) {
    menusController.createMenu(req, res, next);
});

// Rota para apagar um menu específico pelo ID
router.delete("/deleteMenu/:menuId", authController.verifyLoginUser, function (req, res, next) {
    menusController.deleteMenu(req, res, next);
});

// Rota para exibir o formulário de edição de um menu específico
router.get("/editMenu/:menuId", authController.verifyLoginUser, function (req, res, next) {
    menusController.renderEditMenu(req, res, next);
});

// Rota para processar o formulário de edição de menus, incluindo upload de imagem
router.put("/editMenu/:menuId", authController.verifyLoginUser, upload.single("menuPic"), function (req, res, next) {
    menusController.updateMenu(req, res, next);
});

// Rota para alternar a visibilidade de um menu (ex.: visível/invisível)
router.patch('/toggleVisibility/:id', menusController.toggleVisibility);

module.exports = router;
