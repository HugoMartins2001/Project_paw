const mongoUser = require('../models/user')
const jwt = require('jsonwebtoken')
const config = require('../jwt_secret/config')
const bcrypt = require('bcryptjs')
const passport = require('passport')

let authController = {}

authController.submittedLogin = function (req, res, next) {
    const emailInput = req.body.email;
    const passwordInput = req.body.password;

    mongoUser.findOne({ email: emailInput })
        .then(function (user) {
            if (!user) {
                // Caso o email não seja encontrado
                return res.render('login/index', { errorMessage: 'Email não encontrado!' });
            }

            bcrypt.compare(passwordInput, user.password)
                .then(function (result) {
                    if (result === true) {
                        const authToken = jwt.sign({ email: user.email }, config.secret, { expiresIn: 86400000 });
                        res.cookie('auth-token', authToken, { maxAge: 86400000 });
                        res.render('login/index', { successMessage: 'Login realizado com sucesso!' });
                    } else {
                        res.render('login/index', { errorMessage: 'Senha incorreta!' });
                    }
                });
        })
        .catch(function (err) {
            next(err);
        });
};

authController.login = function (req, res, next) {
    res.render('login/index')
};

authController.logout = function (req, res, next) {
    res.clearCookie('auth-token');
    res.redirect('/?logoutSuccess=true'); 
};

authController.createLogin = function (req, res, next) {
    res.render('login/createUser')
};

authController.createLoginSubmitted = function (req, res, next) {
    if (req.file) {
        req.body.profilePic = `/uploads/${req.file.filename}`;
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, 8);
    req.body.password = hashedPassword;

    mongoUser.create(req.body)
        .then(function () {
            // Renderiza a página com uma mensagem de sucesso
            res.render('login/createUser', { successMessage: 'Registro realizado com sucesso!' });
        })
        .catch(function (err) {
            next(err);
        });
};

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