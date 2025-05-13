const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const profile = require("../controllers/profile");
const upload = require('../middlewares/upload');
const profileController = require("../controllers/profile");

// Middleware para verificar se o usuário está autenticado
router.use(authController.verifyLoginUser);

// Rota para exibir o perfil do usuário
router.get("/", profileController.showProfile, (req, res) => {
  res.json("dashboard/profile", {
    user: req.user, // Dados do usuário autenticado
    totalRestaurants: 0, // Total de restaurantes (pode ser atualizado dinamicamente)
    approvedRestaurants: 0, // Total de restaurantes aprovados
    notApprovedRestaurants: 0, // Total de restaurantes não aprovados
  });
});

// Rota para exibir o formulário de edição do perfil
router.get("/editProfile", profile.editProfile);

// Rota para processar o formulário de edição do perfil, incluindo upload de imagem de perfil
router.post("/editProfile", upload.single("profilePic"), profile.updateProfile);

module.exports = router; // Exporta o roteador para ser usado em outros arquivos
