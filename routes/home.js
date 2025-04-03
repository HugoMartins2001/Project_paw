var express = require('express');
var router = express.Router();
const authController = require('../controllers/auth');


router.get('/', function(req, res) {
    res.render('home/home'); 
});

router.get('/auth/login', authController.login);


router.get('/auth/register', authController.createLogin);


router.get('/profile', authController.verifyLoginUser, function(req, res) {
    res.render('profile', { user: req.user }); // Só acessível para usuários autenticados
});

module.exports = router;
