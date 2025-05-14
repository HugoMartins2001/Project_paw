var express = require("express");
var router = express.Router();
const restaurantsController = require("../controllers/restaurants");
const authController = require("../controllers/auth");
const upload = require("../middlewares/upload");

// Middleware para adicionar o usuário autenticado às variáveis locais (disponível nas views)
router.use((req, res, next) => {
  res.locals.user = req.user || null; // Define `user` como null se não estiver autenticado
  next();
});

// Rota para exibir os detalhes de um restaurante específico pelo nome
router.get("/showRestaurant/:name", /*authController.verifyLoginUser, */function (req, res, next) {
  restaurantsController.showDetails(req, res, next);
});

// Rota para exibir o formulário de criação de restaurantes
router.get("/submitRestaurant", authController.verifyLoginUser, function (req, res, next) {
  restaurantsController.renderCreateRestaurant(req, res, next);
});

// Rota para processar o formulário de criação de restaurantes, incluindo upload de imagem
router.post("/submittedRestaurant", upload.single("restaurantPic"), authController.verifyLoginUser, restaurantsController.processCreateRestaurant, function (req, res, next) {
    restaurantsController.createRestaurant(req, res, next);
  }
);

// Rota para exibir todos os restaurantes
router.get("/showRestaurants", /*authController.verifyLoginUser*/ function (req, res, next) {
  restaurantsController.showAll(req, res, next);
});

// Rota para deletar um restaurante específico pelo ID
router.post("/deleteRestaurant/:id", authController.verifyLoginUser, function (req, res, next) {
  restaurantsController.deleteRestaurant(req, res, next);
});

// Rota para exibir o formulário de edição de um restaurante específico pelo ID
router.get("/editRestaurant/:id", authController.verifyLoginUser, function (req, res, next) {
  restaurantsController.renderEditRestaurant(req, res, next);
});

// Rota para processar o formulário de edição de restaurantes, incluindo upload de imagem
router.post("/editRestaurant/:id", upload.single("restaurantPic"), authController.verifyLoginUser, restaurantsController.processUpdateRestaurant, function (req, res, next) {
    restaurantsController.updateRestaurant(req, res, next);
  }
);

// Rota para exibir restaurantes pendentes de aprovação
router.get("/pendingApproval", authController.verifyLoginUser, restaurantsController.showPendingRestaurants);

// Rota para aprovar um restaurante específico pelo ID
router.post("/approveRestaurant/:id", authController.verifyLoginUser, restaurantsController.approveRestaurant);

// Rota para alternar a visibilidade de um restaurante (ex.: visível/invisível)
router.post('/toggleVisibility/:id', restaurantsController.toggleVisibility);

module.exports = router; // Exporta o roteador para ser usado em outros arquivos
