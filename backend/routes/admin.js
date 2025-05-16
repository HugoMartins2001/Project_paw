const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const adminController = require("../controllers/admin");


// Middleware para verificar se o utilizador está autenticado e tem o papel de Admin
router.use(authController.verifyLoginUser, (req, res, next) => {
  if (req.user.role !== "Admin") {
    // Se o utilizador não for Admin, retorna erro 403 (Acesso negado)
    return res.status(403).json({ error: "Access denied." });
  }
  next(); // Continua para a próxima rota se o utilizador for Admin
});

// Rota para visualizar os logs
router.get("/logs", adminController.viewLogs);

// Rota para eleminar todos os logs
router.post("/logs/deleteAll", adminController.deleteAllLogs);

// Rota para eleminar um log específico pelo ID
router.post("/logs/:logId/delete", adminController.deleteLog);

module.exports = router; // Exporta o router para ser usado em outros arquivos