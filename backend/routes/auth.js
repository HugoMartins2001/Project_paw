var express = require('express');
var router = express.Router();
const authController = require('../controllers/auth');
const passport = require('passport');
const registerCheckEmail = require('../middlewares/registerCheckEmail');
const jwt = require('jsonwebtoken');

// Rota para exibir a página de login
router.get('/login', authController.login);

// Rota para processar o formulário de login submetido
router.post('/loginSubmitted', authController.submittedLogin);

// Rota para logout do usuário
router.get('/logout', authController.logout);

// Rota para exibir a página de registro
router.get('/register', authController.createLogin);

// Rota para processar o formulário de registro submetido
router.post('/registerSubmitted', registerCheckEmail, authController.createLoginSubmitted);

// Rota para exibir o formulário de login (exemplo de renderização direta)
router.get('/loginform', (req, res) => {
    res.json('login/dashboard'); 
});

// Rota para exibir o formulário de recuperação de senha
router.get('/forgot-password', (req, res) => {
    res.json('login/forgotPassword'); // Renderiza a página forgotPassword.ejs
});

// Rota para processar o formulário de recuperação de senha
router.post('/forgot-password', authController.forgotPassword);

// Rota para exibir o formulário de redefinição de senha
router.get('/reset-password/:token', (req, res) => {
    const { token } = req.params;
    res.json('login/resetPassword', { token, errorMessage: null });
});

// Rota para processar a redefinição de senha
router.post('/reset-password/:token', authController.resetPassword);

// Rota para exibir o formulário de registro (exemplo de renderização direta)
router.get('/registerform', (req, res) => {
    res.json('login/createUser'); 
});

// Rota para autenticação com Google (redireciona para o Google para autenticação)
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }), authController.verifyLoginUser);

router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/auth/login' }),
    async (req, res) => {
        const authToken = jwt.sign({ email: req.user.email }, process.env.JWT_SECRET, { expiresIn: '2h' });

        // Verificar se o usuário está bloqueado
        if (req.user.isBlocked) {
            return res.redirect('http://localhost:4200/login?login=blocked');
        }

        // Redireciona para o frontend com o token na query string
        res.redirect(`http://localhost:4200/clientHome?token=${authToken}`);
    }
);

module.exports = router; // Exporta o roteador para ser usado em outros arquivos