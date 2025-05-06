require('dotenv').config(); // Carrega as variáveis do .env

const nodemailer = require('nodemailer');

// Configuração do Nodemailer usando variáveis de ambiente
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

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

    // Bloqueia o login após 5 tentativas falhadas
    if (attempts.count >= 2) {
        // Bloqueia o usuário no banco de dados
        mongoUser.findOneAndUpdate({ email: emailInput }, { isBlocked: true }, { new: true }) // Retorna o documento atualizado
            .then((user) => {
                if (user) {
                    // Envia um e-mail ao administrador
                    const mailOptions = {
                        from: process.env.EMAIL_USER,
                        to: 'hugolm280@hotmail.com', // Substitua pelo e-mail do administrador
                        subject: '🚨 User Blocked Due to Failed Login Attempts',
                        html: `
                            <div style="font-family: 'Roboto', sans-serif; max-width: 600px; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
                                <div style="background-color: #2c3e50; color: white; padding: 20px; text-align: center;">
                                    <h1 style="margin: 0; font-size: 28px;">🚨 User Blocked Alert</h1>
                                    <p style="margin: 5px 0 0; font-size: 16px;">Immediate Action Required</p>
                                </div>
                                <div style="padding: 20px; background-color: #ecf0f1; color: #2c3e50; line-height: 1.6;">
                                    <p style="font-size: 16px; margin: 0 0 10px;">Dear Administrator,</p>
                                    <p style="font-size: 14px; margin: 0 0 20px;">The following user has been <strong style="color: #e74c3c;">blocked</strong> due to multiple failed login attempts:</p>
                                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
                                        <tr>
                                            <td style="padding: 10px; border: 1px solid #bdc3c7; background-color: #ffffff;"><strong>Email:</strong></td>
                                            <td style="padding: 10px; border: 1px solid #bdc3c7; background-color: #ffffff;">${emailInput}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 10px; border: 1px solid #bdc3c7; background-color: #ffffff;"><strong>Role:</strong></td>
                                            <td style="padding: 10px; border: 1px solid #bdc3c7; background-color: #ffffff;">${user.role || 'N/A'}</td>
                                        </tr>
                                    </table>
                                    <p style="font-size: 14px; margin: 0 0 20px;">Please review the user's account and take the necessary actions to unblock them if appropriate.</p>
                                    <div style="text-align: center; margin: 20px 0;">
                                        <a href="http://localhost:3000" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; font-size: 14px; border-radius: 5px; display: inline-block;">Unblock User</a>
                                    </div>
                                    <p style="font-size: 14px; margin: 0;">If you have any questions, please contact the support team.</p>
                                </div>
                                <div style="background-color: #34495e; color: white; padding: 10px; text-align: center; font-size: 12px;">
                                    <p style="margin: 0;">This is an automated message. Please do not reply to this email.</p>
                                </div>
                            </div>
                        `
                    };
    
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            console.error('Error sending email:', error);
                        } else {
                            console.log('Email sent:', info.response);
                        }
                    });
                }
            })
            .catch((err) => {
                console.error('Error blocking user:', err);
            });
    
        return res.render('login/index', { errorMessage: 'Your account has been blocked. Please contact support.' });
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

                        const authToken = jwt.sign({ email: user.email }, config.secret, { expiresIn: '2h' }); // Token expira em 2 horas
                        res.cookie('auth-token', authToken, { maxAge: 2 * 60 * 60 * 1000 }); // Cookie expira em 2 horas (em milissegundos)
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