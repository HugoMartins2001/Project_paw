var express = require('express');
var router = express.Router();
const dashboardController = require('../controllers/dashboard');

// Middleware para verificar se o utilizador está autenticado
router.get('/', dashboardController.renderDashboard);

// Rota para obter os dados do dashboard
router.get('/data',dashboardController.getDashboardData);

module.exports = router;
