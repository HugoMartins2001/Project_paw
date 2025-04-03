var express = require('express');
var router = express.Router();
const authController = require('../controllers/auth')


router.get('/login', authController.login );

router.post('/loginSubmitted', authController.submittedLogin );

router.get('/logout', authController.logout );

router.get('/register', authController.createLogin );

router.post('/registerSubmitted', authController.createLoginSubmitted);

router.get('/loginform', (req, res) => {
    res.render('login/index'); 
});

router.get('/registerform', (req, res) => {
    res.render('login/createUser'); 
});

module.exports = router;