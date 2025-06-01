const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const verifyJWT = require("../middlewares/verifyJWT");

// Middleware para permitir acesso apenas a administradores
function onlyAdmins(req, res, next) {
  if (req.user && req.user.role === "Admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied" });
  }
}

// Rota para exibir todos os utilizadores (apenas para administradores)
router.get("/showUsers", verifyJWT, onlyAdmins, usersController.showUsers);

// Rota para bloquear os utilizadores (apenas para administradores)
router.patch('/block/:id', verifyJWT, onlyAdmins, usersController.toggleBlockUser);

module.exports = router;
