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

    // Cria uma chave única para rastrear tentativas por email e IP
    const loginKey = `${emailInput}-${clientIp}`;

    // Inicializa ou incrementa o contador de tentativas de login
    if (!loginAttempts[loginKey]) {
        loginAttempts[loginKey] = { count: 0, lastAttempt: Date.now() };
    }

    const attempts = loginAttempts[loginKey];

    // Bloqueia o login se houver muitas tentativas em um curto período
    if (attempts.count >= 5 && Date.now() - attempts.lastAttempt < 15 * 60 * 1000) {
        return res.render('login/index', { errorMessage: 'Too many login attempts. Please try again later..' });
    }

    mongoUser.findOne({ email: emailInput })
        .then(function (user) {
            if (!user) {
                // Caso o email não seja encontrado
                attempts.count++;
                attempts.lastAttempt = Date.now();
                return res.render('login/index', { errorMessage: 'Email not found!' });
            }

            // Verifica se o utilizador está bloqueado
            if (user.isBlocked) {
                return res.render('login/index', { errorMessage: 'Your account has been blocked. Please contact support.' });
            }

            bcrypt.compare(passwordInput, user.password)
                .then(function (result) {
                    if (result === true) {
                        // Login bem-sucedido, reseta o contador de tentativas
                        loginAttempts[loginKey] = { count: 0, lastAttempt: Date.now() };

                        const authToken = jwt.sign({ email: user.email }, config.secret, { expiresIn: 86400000 });
                        res.cookie('auth-token', authToken, { maxAge: 86400000 });
                        res.render('login/index', { successMessage: 'Login successfully!' });
                    } else {
                        // Senha incorreta
                        attempts.count++;
                        attempts.lastAttempt = Date.now();
                        res.render('login/index', { errorMessage: 'Password incorrect!' });
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
        return res.render('login/createUser', { errorMessage: 'Email and password are required!' });
    }

    // Validação de formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
        return res.render('login/createUser', { errorMessage: 'Invalid email format!' });
    }

    // Validação de força da senha (mínimo de 8 caracteres)
    if (req.body.password.length < 8) {
        return res.render('login/createUser', { errorMessage: 'Password must be at least 8 characters long!' });
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, 8);
    req.body.password = hashedPassword;

    mongoUser.create(req.body)
        .then(function () {
            res.render('login/createUser', { successMessage: 'Registration completed successfully!' });
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
                return res.redirect('/auth/login'); // Redireciona para a página de login em caso de erro
            }
            mongoUser.findOne({ email: decoded.email })
                .then(function (user) {
                    if (!user) {
                        return res.redirect('/auth/login'); // Redireciona se o usuário não for encontrado
                    }

                    // Verifica se o usuário está bloqueado
                    if (user.isBlocked) {
                        res.clearCookie('auth-token'); // Remove o cookie de autenticação
                        return res.redirect('/auth/login?error=blocked'); // Redireciona com mensagem de erro
                    }

                    req.user = user; // Adiciona o usuário à requisição
                    next(); // Permite o acesso à próxima rota
                })
                .catch(function (err) {
                    next(err); // Passa o erro para o middleware de tratamento de erros
                });
        });
    } else {
        res.redirect('/auth/login'); // Redireciona para a página de login se o token não estiver presente
    }
};

// Login com Google
authController.googleLogin = passport.authenticate('google', { scope: ['profile', 'email'] });

// Callback do Google
authController.googleCallback = passport.authenticate('google', { failureRedirect: '/auth/login' }, (req, res) => {
    res.redirect('/'); // Redireciona para a página inicial após login
});

module.exports = authController;