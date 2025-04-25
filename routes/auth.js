var express = require('express');
var router = express.Router();
const authController = require('../controllers/auth');
const passport = require('passport');
const upload = require('../middlewares/upload');

// Rota para exibir a página de login
router.get('/login', authController.login);

// Rota para processar o formulário de login submetido
router.post('/loginSubmitted', authController.submittedLogin);

// Rota para logout do usuário
router.get('/logout', authController.logout);

// Rota para exibir a página de registro
router.get('/register', authController.createLogin);

// Rota para processar o formulário de registro submetido, incluindo upload de imagem de perfil
router.post('/registerSubmitted', upload.single('profilePic'), authController.createLoginSubmitted);

// Rota para exibir o formulário de login (exemplo de renderização direta)
router.get('/loginform', (req, res) => {
    res.render('login/dashboard'); 
});

// Rota para exibir o formulário de registro (exemplo de renderização direta)
router.get('/registerform', (req, res) => {
    res.render('login/createUser'); 
});

// Rota para autenticação com Google (redireciona para o Google para autenticação)
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Rota de callback para autenticação com Google (redireciona após autenticação bem-sucedida ou falha)
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/auth/login' }),
    (req, res) => {
        res.redirect('/dashboard'); // Redireciona para o dashboard após login bem-sucedido
    }
);

module.exports = router; // Exporta o roteador para ser usado em outros arquivos