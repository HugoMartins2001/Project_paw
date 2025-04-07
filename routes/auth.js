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

// Rota para capturar o email manualmente
router.get('/facebook/email', (req, res) => {
    res.render('login/facebookRegistoEmail', { user: req.user });
});

router.post('/facebook/email', async (req, res) => {
    try {
        const { facebookId, name, email } = req.body;

        console.log('Dados recebidos do formulário:', { facebookId, name, email });

        // Verifica se o email já existe no banco de dados
        let user = await authController.findUserByEmail(email);

        if (user) {
            console.log('Email já registrado:', email);
            return res.redirect('/auth/login'); // Redireciona para login se o email já estiver registrado
        }

        // Atualiza o usuário no banco de dados com o email fornecido
        user = await authController.updateUserEmail(facebookId, email);

        if (!user) {
            console.log('Erro ao atualizar o usuário no banco de dados.');
            return res.redirect('/');
        }

        console.log('Usuário atualizado com sucesso:', user);

        // Finaliza o processo de autenticação
        req.login(user, (err) => {
            if (err) {
                console.log('Erro no req.login:', err);
                return res.redirect('/');
            }
            console.log('Usuário autenticado com sucesso:', user);
            res.redirect('/dashboard'); // Redireciona para a página inicial
        });
    } catch (err) {
        console.log('Erro no processo:', err);
        res.redirect('/');
    }
});

module.exports = router;