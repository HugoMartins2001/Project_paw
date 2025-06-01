const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const profile = require("../controllers/profile");
const profileController = require("../controllers/profile");

// Middleware para verificar se o usuário está autenticado
router.use(authController.verifyLoginUser);

// Rota para exibir o perfil do usuário
router.get("/", profileController.showProfile, (req, res) => {
  res.json({
    user: req.user,
    totalRestaurants: 0, 
    approvedRestaurants: 0, 
    notApprovedRestaurants: 0, 
  });
});

// Rota para exibir o formulário de edição do perfil
router.get("/editProfile", profile.editProfile);

// Rota para processar o formulário de edição do perfil, incluindo upload de imagem de perfil
router.post("/editProfile", profile.updateProfile);

module.exports = router;
