var express = require('express');
var router = express.Router();
const dashboardController = require('../controllers/dashboard');

// Rota para o dashboard
router.get('/', dashboardController.renderDashboard);

// Rota para buscar os dados do dashboard
router.get('/data',dashboardController.getDashboardData);

module.exports = router;
