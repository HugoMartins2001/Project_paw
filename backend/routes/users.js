const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const verifyJWT = require("../middlewares/verifyJWT");

// Middleware para permitir acesso apenas a administradores
function onlyAdmins(req, res, next) {
  console.log('onlyAdmins:', req.user); // <-- LOG
  if (req.user && req.user.role === "Admin") {
    next();
  } else {
    console.log('Acesso negado: não é admin');
    res.status(403).json({ message: "Acesso negado" }); // Retorna erro 403 se o usuário não for Admin
  }
}

// Rota para exibir todos os utilizadores (apenas para administradores)
router.get("/showUsers", verifyJWT, onlyAdmins, usersController.showUsers);

// Rota para bloquear os utilizadores (apenas para administradores)
router.post('/block/:id', verifyJWT, onlyAdmins, usersController.toggleBlockUser);

module.exports = router; // Exporta o roteador para ser usado em outros arquivos
