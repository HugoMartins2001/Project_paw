var express = require('express');
var router = express.Router();
const authController = require('../controllers/auth')


router.get('/', authController.verifyLoginUser, function(req, res) {
  res.render('index', { user: req.user });
});

module.exports = router;
