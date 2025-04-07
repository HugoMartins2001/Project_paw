var express = require('express');
var router = express.Router();
const authController = require('../controllers/auth');
const passport = require('passport');


router.get('/login', authController.login );

router.post('/loginSubmitted', authController.submittedLogin );

router.get('/logout', authController.logout );

router.get('/register', authController.createLogin );

router.post('/registerSubmitted', authController.createLoginSubmitted);

router.get('/loginform', (req, res) => {
    res.render('login/dashboard'); 
});

router.get('/registerform', (req, res) => {
    res.render('login/createUser'); 
});

// Rotas para autenticação com Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/auth/login' }),
    (req, res) => {
        res.redirect('/dashboard'); // Redireciona para a página após login bem-sucedido
    }
);

// Rotas para autenticação com Facebook
router.get('/facebook', passport.authenticate('facebook'));

router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/auth/login' }),
    (req, res) => {
        // Verifica se o email está disponível
        if (!req.user.email) {
            // Redireciona para a rota para capturar o email manualmente
            return res.redirect('/auth/facebook/email');
        }
        res.redirect('/dashboard'); // Redireciona para a página inicial após login bem-sucedido
    }
);


router.get('/facebook/email', (req, res) => {
    res.render('login/facebookRegistoEmail', { user: req.user });
});


router.post('/facebook/email', authController.facebookEmailSubmitted);


router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/auth/login' }), authController.facebookCallback);



module.exports = router;