var express = require('express');
var router = express.Router();
const authController = require('../controllers/auth');
const dashboardController = require('../controllers/dashboard');

// Rota para o dashboard
router.get('/', authController.verifyLoginUser, dashboardController.renderDashboard);

module.exports = router;
