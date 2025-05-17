require('dotenv').config(); // Carrega as variáveis do .env

const nodemailer = require('nodemailer');

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
const crypto = require('crypto');

let authController = {};

// Armazena tentativas de login por IP para evitar ataques de força bruta
const loginAttempts = {};

authController.forgotPassword = async function (req, res) {
    const { email } = req.body;

    try {
        const user = await mongoUser.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'Email not found!' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
        await user.save();

        const resetUrl = `http://localhost:4200/reset-password/${resetToken}`; const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: '🔐 Password Reset Request',
            html: `
                <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; border-radius: 10px; overflow: hidden; box-shadow: 0 0 15px rgba(0, 0, 0, 0.08); background-color: #ffffff; border: 1px solid #e0e0e0;">
                
                <!-- Header -->
                <div style="background-color: #3498db; padding: 30px 20px; text-align: center;">
                    <img 
                    src="https://i.imgur.com/v1irJwp.jpeg" 
                    alt="App Logo" 
                    width="80" 
                    height="80" 
                    style="border-radius: 50%; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); margin-bottom: 10px;"
                    />
                    <h1 style="color: #ffffff; font-size: 22px; margin: 10px 0 0;">Password Reset Request</h1>
                    <p style="color: #ecf0f1; font-size: 14px; margin: 5px 0 0;">Secure your account with a new password</p>
                </div>

                <!-- Body -->
                <div style="padding: 25px 20px; color: #2c3e50; background-color: #f9f9f9;">
                    <p style="font-size: 16px; margin-bottom: 15px;">Hi there, ${user.name}</p>
                    <p style="font-size: 14px; margin-bottom: 25px;">
                    We received a request to reset your password. Click the button below to proceed. This link is valid for a limited time.
                    </p>
                    <div style="text-align: center; margin-bottom: 30px;">
                    <a href="${resetUrl}" 
                        style="background: linear-gradient(to right, #3498db, #2980b9); background-color: black; color: white; padding: 14px 28px; text-decoration: none; font-size: 15px; border-radius: 6px; font-weight: bold;">
                        🔐 Reset Password
                    </a>
                    </div>
                    <p style="font-size: 13px; color: #7f8c8d;">If you didn't request this, you can safely ignore this email.</p>
                </div>

                <!-- Footer -->
                <div style="background-color: #ecf0f1; color: #7f8c8d; text-align: center; font-size: 12px; padding: 15px;">
                    <p style="margin: 0;">This is an automated message from <strong>OrdEat</strong>. Please do not reply.</p>
                </div>
                </div>
            `
        };


        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({ success: false, message: 'Error sending email. Please try again later.' });
            }
            console.log('Email sent:', info.response);
            res.status(200).json({ success: true, message: 'Password reset email sent successfully!' });
        });
    } catch (error) {
        console.error('Error during password reset request:', error);
        res.status(500).json({ success: false, message: 'An error occurred. Please try again later.' });
    }
};

authController.resetPassword = async function (req, res) {
    const { token } = req.params;
    const { password } = req.body;

    console.log('RESET PASSWORD - Token recebido:', token);
    console.log('RESET PASSWORD - Novo password recebido:', password);

    try {
        const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
        console.log('RESET PASSWORD - Token hash:', resetTokenHash);

        const user = await mongoUser.findOne({
            resetPasswordToken: resetTokenHash,
            resetPasswordExpires: { $gt: Date.now() },
        });

        console.log('RESET PASSWORD - Utilizador encontrado:', user);

        if (!user) {
            console.log('RESET PASSWORD - Token inválido ou expirado!');
            return res.status(400).json({ success: false, message: 'Invalid or expired token!' });
        }

        const hashedPassword = bcrypt.hashSync(password, 8);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        console.log('RESET PASSWORD - Password alterada com sucesso para o utilizador:', user.email);

        res.status(200).json({ success: true, message: 'Password reset successfully!' });
    } catch (error) {
        console.error('Error during password reset:', error);
        res.status(500).json({ success: false, message: 'An error occurred. Please try again later.' });
    }
};

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
    if (attempts.count >= 5) {
        // Bloqueia o usuário no banco de dados
        mongoUser.findOneAndUpdate({ email: emailInput }, { isBlocked: true }, { new: true }) // Retorna o documento atualizado
            .then((user) => {
                if (user) {
                    // Envia um e-mail para o usuário bloqueado
                    const userMailOptions = {
                        from: process.env.EMAIL_USER,
                        to: emailInput,
                        subject: '🚨 Your Account Has Been Blocked',
                        html: `
                            <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0, 0, 0, 0.1); background-color: #ffffff; border: 1px solid #e0e0e0;">

                            <!-- Header with Logo -->
                            <div style="background: #e74c3c; padding: 30px 20px; text-align: center;">
                                <img 
                                src="https://i.imgur.com/v1irJwp.jpeg" 
                                alt="App Logo" 
                                width="70" 
                                height="70" 
                                style="border-radius: 50%; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); margin-bottom: 15px; display: block; margin-left: auto; margin-right: auto;" 
                                />
                                <h1 style="color: #ffffff; font-size: 24px; margin: 0;">🚨 Account Blocked</h1>
                                <p style="color: #f9f9f9; font-size: 15px; margin-top: 8px;">Security Notification</p>
                            </div>

                            <!-- Body -->
                            <div style="padding: 25px 20px; color: #2c3e50; background-color: #f9f9f9;">
                                <p style="font-size: 16px; margin-bottom: 15px;">Hello,</p>
                                <p style="font-size: 14px; margin-bottom: 20px;">
                                Your account on <strong>OrdEat</strong> has been <strong style="color: #e74c3c;">temporarily blocked</strong> after multiple unsuccessful login attempts. This measure is in place to protect your data and prevent unauthorized access.
                                </p>
                                <p style="font-size: 14px; margin-bottom: 20px;">
                                If this action was unexpected or made in error, please contact our support team to resolve the issue and restore access.
                                </p>
                                <div style="text-align: center; margin-bottom: 30px;">
                                <a href="mailto:support@OrdEat.com" 
                                    style="background: linear-gradient(to right, #3498db, #2980b9); color: white; padding: 14px 30px; text-decoration: none; font-size: 15px; border-radius: 6px; font-weight: bold;">
                                    📩 Contact Support
                                </a>
                                </div>
                                <p style="font-size: 13px; color: #7f8c8d;">Your security is our priority. Thank you for understanding.</p>
                            </div>

                            <!-- Footer -->
                            <div style="background-color: #ecf0f1; color: #7f8c8d; text-align: center; font-size: 12px; padding: 15px;">
                                <p style="margin: 0;">This is an automated message from <strong>OrdEat</strong>. Please do not reply directly to this email.</p>
                            </div>

                            </div>
                        `
                    };


                    transporter.sendMail(userMailOptions, (error, info) => {
                        if (error) {
                            console.error('Error sending email to user:', error);
                        } else {
                            console.log('Email sent to user:', info.response);
                        }
                    });

                    // Busca todos os administradores no banco de dados
                    mongoUser.find({ role: 'Admin' }).then((admins) => {
                        const adminEmails = admins.map(admin => admin.email); // Extrai os e-mails dos administradores

                        if (adminEmails.length > 0) {
                            // Envia um e-mail para todos os administradores
                            const adminMailOptions = {
                                from: process.env.EMAIL_USER,
                                to: adminEmails.join(','), // Junta os e-mails em uma string separada por vírgulas
                                subject: '🚨 User Blocked Due to Failed Login Attempts',
                                html: `
                                    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0, 0, 0, 0.1); background-color: #ffffff; border: 1px solid #e0e0e0;">
                                        <!-- Header -->
                                        <div style="background: #2c3e50; padding: 30px 20px; text-align: center;">
                                            <img src="https://i.imgur.com/v1irJwp.jpeg" alt="App Logo" width="60" height="60" style=" margin-bottom: 20px; border-radius: 50%; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); display: block; margin-left: auto; margin-right: auto;" />
                                            <h1 style="color: #ffffff; font-size: 24px; margin: 0;">🚨 User Blocked Alert</h1>
                                            <p style="color: #ecf0f1; font-size: 15px; margin-top: 8px;">Security Notification</p>
                                        </div>
                            
                                        <!-- Body -->
                                        <div style="padding: 25px 20px; color: #2c3e50; background-color: #f9f9f9;">
                                            <p style="font-size: 16px; margin-bottom: 15px;">Dear Administrator,</p>
                                            <p style="font-size: 14px; margin-bottom: 25px;">
                                                A user account has been <strong style="color: #e74c3c;">temporarily blocked</strong> due to repeated failed login attempts. Please review the details below:
                                            </p>
                            
                                            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                                                <tr>
                                                    <td style="padding: 12px; background-color: #ffffff; border: 1px solid #dcdcdc;"><strong>📧 Email:</strong></td>
                                                    <td style="padding: 12px; background-color: #ffffff; border: 1px solid #dcdcdc;">${emailInput}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 12px; background-color: #ffffff; border: 1px solid #dcdcdc;"><strong>👤 Role:</strong></td>
                                                    <td style="padding: 12px; background-color: #ffffff; border: 1px solid #dcdcdc;">${user.role || 'N/A'}</td>
                                                </tr>
                                            </table>
                            
                                            <p style="font-size: 14px; margin-bottom: 20px;">Click the button below to manage or unblock this user if appropriate:</p>
                            
                                            <div style="text-align: center; margin-bottom: 30px;">
                                                <a href="http://localhost:3000" style="background: linear-gradient(to right, #27ae60, #2ecc71); color: white; padding: 14px 30px; text-decoration: none; font-size: 15px; border-radius: 6px; font-weight: bold;">
                                                    🔓 Unblock User
                                                </a>
                                            </div>
                            
                                            <p style="font-size: 13px; color: #666;">If this alert was not expected, please investigate immediately or contact your IT security team.</p>
                                        </div>
                            
                                        <!-- Footer -->
                                        <div style="background-color: #ecf0f1; color: #7f8c8d; text-align: center; font-size: 12px; padding: 15px;">
                                            <p style="margin: 0;">This is an automated message from <strong>Your Website</strong>. Do not reply directly to this email.</p>
                                        </div>
                                    </div>
                                `
                            };

                            transporter.sendMail(adminMailOptions, (error, info) => {
                                if (error) {
                                    console.error('Error sending email to admins:', error);
                                } else {
                                    console.log('Email sent to admins:', info.response);
                                }
                            });
                        } else {
                            console.warn('No administrators found to notify.');
                        }
                    }).catch((err) => {
                        console.error('Error fetching administrators:', err);
                    });
                }
            })
            .catch((err) => {
                console.error('Error blocking user:', err);
            });

        return res.json({ errorMessage: 'Your account has been blocked. Please contact support.' });
    }

    mongoUser.findOne({ email: emailInput })
        .then(function (user) {
            if (!user) {
                // Caso o email não seja encontrado
                attempts.count++;
                attempts.lastAttempt = Date.now();
                return res.status(401).json({ erros: { email: "Email não encontrado." } });
            }

            // Verifica se o utilizador está bloqueado
            if (user.isBlocked) {
                res.status(403).json({ error: 'Your account has been blocked. Please contact support.' });
            }

            bcrypt.compare(passwordInput, user.password)
                .then(function (result) {
                    if (result === true) {
                        // Login bem-sucedido, reseta o contador de tentativas
                        loginAttempts[loginKey] = { count: 0, lastAttempt: Date.now() };

                        const authToken = jwt.sign({ email: user.email }, config.secret, { expiresIn: '2h' }); // Token expira em 2 horas
                        res.cookie('auth-token', authToken, { maxAge: 2 * 60 * 60 * 1000 }); // Cookie expira em 2 horas (em milissegundos)
                        res.json({
                            token: authToken,
                            userId: user._id,
                            role: user.role,
                            name: user.name,
                            successMessage: 'Login successfully!'
                        });
                    } else {
                        // Senha incorreta
                        attempts.count++;
                        attempts.lastAttempt = Date.now();
                        return res.status(401).json({ erros: { password: "Password incorreta." } });
                    }
                });
        })
        .catch(function (err) {
            next(err);
        });
};

// jsoniza a página de login
authController.login = function (req, res, next) {
    res.json('login/index');
};

// Controlador para logout
authController.logout = function (req, res, next) {
    res.clearCookie('auth-token');
    res.redirect('/?logoutSuccess=true');
};

// jsoniza a página de criação de login
authController.createLogin = function (req, res, next) {
    res.json('login/createUser');
};

// Controlador para processar a criação de login
authController.createLoginSubmitted = function (req, res, next) {
    const hashedPassword = bcrypt.hashSync(req.body.password, 8);
    req.body.password = hashedPassword;

    mongoUser.create(req.body)
        .then(function () {
            res.json({ successMessage: 'Registration completed successfully!' });
        })
        .catch(function (err) {
            if (err.code === 11000) {
                return res.status(500).json({ error: 'Email already registered!' });
            }
            // Se for erro de validação do mongoose
            if (err.name === 'ValidationError') {
                return res.status(400).json({ error: err.message });
            }
            // Para outros erros, devolve sempre JSON
            res.status(500).json({ error: 'Erro ao registar utilizador.' });
        });
};

// Middleware para verificar se o usuário está autenticado
authController.verifyLoginUser = function (req, res, next) {
    const authToken = req.cookies['auth-token'] || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    if (authToken) {
        jwt.verify(authToken, config.secret, function (err, decoded) {
            if (err) {
                return res.status(401).json({ error: 'Invalid token' });
            }
            mongoUser.findOne({ email: decoded.email })
                .then(function (user) {
                    if (!user) {
                        return res.status(401).json({ error: 'User not found' });
                    }
                    if (user.isBlocked) {
                        res.clearCookie('auth-token');
                        return res.status(403).json({ error: 'User blocked' });
                    }
                    req.user = user;
                    next();
                })
                .catch(function (err) {
                    next(err);
                });
        });
    } else {
        res.status(401).json({ error: 'No token provided' });
    }
};

// Middleware para anexar o usuário ao request se existir
authController.attachUserIfExists = function (req, res, next) {
    const authToken = req.cookies['auth-token'] || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    if (authToken) {
        jwt.verify(authToken, config.secret, function (err, decoded) {
            if (!err && decoded) {
                mongoUser.findOne({ email: decoded.email })
                    .then(function (user) {
                        if (user) req.user = user;
                        next();
                    })
                    .catch(() => next());
            } else {
                next();
            }
        });
    } else {
        next();
    }
};

// Login com Google
authController.googleLogin = passport.authenticate('google', { scope: ['profile', 'email'] });

// Callback do Google
authController.googleCallback = passport.authenticate('google', { failureRedirect: '/auth/login' }, (req, res) => {
    res.json('/'); // Redireciona para a página inicial após login
});



module.exports = authController;