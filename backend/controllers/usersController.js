const mongoUser = require("../models/user");
const nodemailer = require("nodemailer");

let usersController = {};

// Controlador para exibir todos os usuários
usersController.showUsers = async (req, res, next) => {
  const user = req.user; 

  try {
    const users = await mongoUser.find({}, { password: 0 });

    res.json({ users, user });
  } catch (err) {
    next(err); 
  }
};

// Controlador para bloquear/desbloquear usuários
usersController.toggleBlockUser = async function (req, res) {
    const userId = req.params.id;

    try {
        const user = await mongoUser.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found!' });
        }

        user.isBlocked = !user.isBlocked;
        await user.save(); 

        const action = user.isBlocked ? 'blocked' : 'unblocked';

        if (!user.isBlocked) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            const mailOptions = {
              from: process.env.EMAIL_USER,
              to: user.email,
              subject: '✅ Your Account Has Been Unblocked',
              html: `
                <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; border-radius: 10px; overflow: hidden; box-shadow: 0 0 15px rgba(0, 0, 0, 0.08); background-color: #ffffff; border: 1px solid #e0e0e0;">

                  <!-- Header with Logo -->
                  <div style="background: #27ae60; padding: 30px 20px; text-align: center;">
                    <img 
                      src="https://i.imgur.com/v1irJwp.jpeg" 
                      alt="App Logo" 
                      width="65" 
                      height="65" 
                      style="border-radius: 50%; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15); margin-bottom: 15px; display: block; margin-left: auto; margin-right: auto;" 
                    />
                    <h1 style="color: #ffffff; font-size: 22px; margin: 0;">✅ Account Unblocked</h1>
                    <p style="color: #f1f1f1; font-size: 14px; margin-top: 8px;">Welcome back to OrdEat</p>
                  </div>

                  <!-- Body -->
                  <div style="padding: 25px 20px; color: #2c3e50; background-color: #f9f9f9;">
                    <p style="font-size: 16px; margin-bottom: 15px;">Hello <strong>${user.name}</strong>,</p>
                    <p style="font-size: 14px; margin-bottom: 20px;">
                      We're happy to inform you that your account on <strong>OrdEat</strong> has been <strong style="color: #27ae60;">successfully unblocked</strong>.
                    </p>
                    <p style="font-size: 14px; margin-bottom: 25px;">
                      You can now log in and resume using all features of our platform.
                    </p>
                    <div style="text-align: center; margin-bottom: 30px;">
                      <a href="http://localhost:3000/auth/login" 
                        style="background: linear-gradient(to right, #2ecc71, #27ae60); color: white; padding: 12px 28px; text-decoration: none; font-size: 15px; border-radius: 6px; font-weight: bold;">
                        🔐 Log In Now
                      </a>
                    </div>
                    <p style="font-size: 13px; color: #7f8c8d;">If you have any questions or issues, don't hesitate to contact our support team.</p>
                  </div>

                  <!-- Footer -->
                  <div style="background-color: #ecf0f1; color: #95a5a6; text-align: center; font-size: 12px; padding: 15px;">
                    <p style="margin: 0;">Thank you for being part of <strong>Project PAW</strong> 🐾</p>
                  </div>

                </div>
              `
            };

            await transporter.sendMail(mailOptions);
            console.log(`Unblock email sent to ${user.email}`);
        }

        res.status(200).json({ success: true, message: `User successfully ${action}!` });
    } catch (error) {
        console.error('Error toggling user block status:', error);
        res.status(500).json({ success: false, message: 'An error occurred. Please try again later.' });
    }
};

module.exports = usersController;
