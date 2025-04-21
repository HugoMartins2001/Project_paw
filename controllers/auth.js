const mongoUser = require('../models/user');
const jwt = require('jsonwebtoken');
const config = require('../jwt_secret/config');
const bcrypt = require('bcryptjs');
const passport = require('passport');

let authController = {};

// Armazena tentativas de login por IP para evitar ataques de força bruta
const loginAttempts = {};

// Controlador para processar o login submetido
authController.submittedLogin = function (req, res, next) {
    const emailInput = req.body.email;
    const passwordInput = req.body.password;
    const clientIp = req.ip; // Obtém o IP do cliente

    // Inicializa ou incrementa o contador de tentativas de login
    if (!loginAttempts[clientIp]) {
        loginAttempts[clientIp] = { count: 0, lastAttempt: Date.now() };
    }

    const attempts = loginAttempts[clientIp];

    // Bloqueia o login se houver muitas tentativas em um curto período
    if (attempts.count >= 5 && Date.now() - attempts.lastAttempt < 15 * 60 * 1000) {
        return res.render('login/index', { errorMessage: 'Muitas tentativas de login. Tente novamente mais tarde.' });
    }

    mongoUser.findOne({ email: emailInput })
        .then(function (user) {
            if (!user) {
                // Caso o email não seja encontrado
                attempts.count++;
                attempts.lastAttempt = Date.now();
                return res.render('login/index', { errorMessage: 'Email não encontrado!' });
            }

            bcrypt.compare(passwordInput, user.password)
                .then(function (result) {
                    if (result === true) {
                        // Login bem-sucedido, reseta o contador de tentativas
                        loginAttempts[clientIp] = { count: 0, lastAttempt: Date.now() };

                        const authToken = jwt.sign({ email: user.email }, config.secret, { expiresIn: 86400000 });
                        res.cookie('auth-token', authToken, { maxAge: 86400000 });
                        res.render('login/index', { successMessage: 'Login realizado com sucesso!' });
                    } else {
                        // Senha incorreta
                        attempts.count++;
                        attempts.lastAttempt = Date.now();
                        res.render('login/index', { errorMessage: 'Senha incorreta!' });
                    }
                });
        })
        .catch(function (err) {
            next(err);
        });
};

// Renderiza a página de login
authController.login = function (req, res, next) {
    res.render('login/index');
};

// Controlador para logout
authController.logout = function (req, res, next) {
    res.clearCookie('auth-token');
    res.redirect('/?logoutSuccess=true');
};

// Renderiza a página de criação de login
authController.createLogin = function (req, res, next) {
    res.render('login/createUser');
};

// Controlador para processar a criação de login
authController.createLoginSubmitted = function (req, res, next) {
    if (req.file) {
        req.body.profilePic = `/uploads/${req.file.filename}`;
    }

    // Validação de entrada: verifica se os campos obrigatórios estão presentes
    if (!req.body.email || !req.body.password) {
        return res.render('login/createUser', { errorMessage: 'Email e senha são obrigatórios!' });
    }

    // Validação de formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
        return res.render('login/createUser', { errorMessage: 'Formato de email inválido!' });
    }

    // Validação de força da senha (mínimo de 8 caracteres)
    if (req.body.password.length < 8) {
        return res.render('login/createUser', { errorMessage: 'A senha deve ter pelo menos 8 caracteres!' });
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, 8);
    req.body.password = hashedPassword;

    mongoUser.create(req.body)
        .then(function () {
            res.render('login/createUser', { successMessage: 'Registro realizado com sucesso!' });
        })
        .catch(function (err) {
            next(err);
        });
};

// Middleware para verificar se o usuário está autenticado
authController.verifyLoginUser = function (req, res, next) {
    const authToken = req.cookies['auth-token'];
    if (authToken) {
        jwt.verify(authToken, config.secret, function (err, decoded) {
            if (err) {
                return res.redirect('/auth/login');
            }
            mongoUser.findOne({ email: decoded.email })
                .then(function (user) {
                    req.user = user;
                    next();
                })
                .catch(function (err) {
                    next(err);
                });
        });
    } else {
        next();
    }
};

// Login com Google
authController.googleLogin = passport.authenticate('google', { scope: ['profile', 'email'] });

// Callback do Google
authController.googleCallback = passport.authenticate('google', { failureRedirect: '/auth/login' }, (req, res) => {
    res.redirect('/'); // Redireciona para a página inicial após login
});

module.exports = authController;