var express = require('express');
var router = express.Router();
const dashboardController = require('../controllers/dashboard');

router.get('/', dashboardController.renderDashboard);

router.get('/data',dashboardController.getDashboardData);

module.exports = router;
