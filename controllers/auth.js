const mongoose = require('mongoose')
const mongoUser = require('../models/user')
const jwt = require('jsonwebtoken')
const config = require('../jwt_secret/config')
const bcrypt = require('bcryptjs')
const passport = require('passport')

let authController = {}

authController.submittedLogin = function(req, res, next) {
    const emailInput = req.body.email
    const passwordInput = req.body.password

    mongoUser.findOne({email:emailInput})
        .then(function(user){
            bcrypt.compare(passwordInput, user.password)
                .then(function(result){
                    if (result ===true){
                        const authToken = jwt.sign({ email: user.email }, config.secret, { expiresIn: 86400000 });
                        res.cookie('auth-token', authToken, {maxAge: 86400000})
                        res.redirect('/index')
                    } else {
                        res.redirect('/auth/login')
                    }
                })
        })
        .catch(function(err){
            next(err)
        })
};

authController.login = function(req, res, next) {
    res.render('login/index')
};

authController.logout = function(req, res, next) {
    res.clearCookie('auth-token')
    res.redirect('/')
};

authController.createLogin = function(req, res, next) {
    res.render('login/createUser')
};

authController.createLoginSubmitted = function(req, res, next) {
    console.log(req.body); 

    const hashedPassword = bcrypt.hashSync(req.body.password, 8);
    req.body.password = hashedPassword

    mongoUser.create(req.body)
        .then(function(){
            res.redirect('/auth/login')
        })
        .catch(function(err){
            next(err)
        })
};

authController.verifyLoginUser = function(req, res, next) {
    const authToken = req.cookies['auth-token'];
    if (authToken) {
        jwt.verify(authToken, config.secret, function(err, decoded) {
            if (err) {
                return res.redirect('/auth/login');  
            }
            mongoUser.findOne({ email: decoded.email })
                .then(function(user) {
                    req.user = user; 
                    next();
                })
                .catch(function(err) {
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

// Login com Facebook
authController.facebookLogin = passport.authenticate('facebook');

// Callback do Facebook
authController.facebookCallback = passport.authenticate('facebook', { failureRedirect: '/auth/login' }, (req, res) => {
    res.redirect('/'); // Redireciona para a página inicial após login
});

authController.updateUserEmail = async (facebookId, email) => {
    try {
        return await User.findOneAndUpdate(
            { facebookId }, // Procura pelo Facebook ID
            { email }, // Atualiza o campo email
            { new: true } // Retorna o documento atualizado
        );
    } catch (err) {
        console.log('Erro ao atualizar o email no banco de dados:', err);
        return null;
    }
};

module.exports = authController;