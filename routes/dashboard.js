var express = require('express');
var router = express.Router();
const authController = require('../controllers/auth')


router.get('/', authController.verifyLoginUser, function(req, res) {~
  res.render('dashboard/dashboard', { user: req.user });
});

module.exports = router;
