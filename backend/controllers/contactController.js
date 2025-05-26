const nodemailer = require('nodemailer');
const mongoUser = require('../models/user');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const contactController = {};

// Enviar email de contacto para todos os administradores
contactController.sendContactEmail = async function (req, res, next) {
    const { name, email, message } = req.body;

    try {
        // Buscar todos os administradores na base de dados
        const admins = await mongoUser.find({ role: "Admin" });
        const adminEmails = admins.map(admin => admin.email);

        if (adminEmails.length === 0) {
            return res.status(500).json({ success: false, error: "Nenhum administrador encontrado." });
        }

        await transporter.sendMail({
            from: `"${name}" <${email}>`,
            to: adminEmails,
            subject: `📨 Contacto do site de ${name}`,
            html: `
                <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; border-radius: 10px; overflow: hidden; box-shadow: 0 0 15px rgba(0, 0, 0, 0.08); background-color: #ffffff; border: 1px solid #e0e0e0;">

                    <!-- Header -->
                    <div style="background: #2980b9; padding: 30px 20px; text-align: center;">
                    <img src="https://i.imgur.com/v1irJwp.jpeg" alt="App Logo" width="60" height="60" style="margin-bottom: 20px; border-radius: 50%; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); display: block; margin-left: auto; margin-right: auto;" />
                    <h1 style="color: #ffffff; font-size: 24px; margin: 0;">📨 Novo Contacto Recebido</h1>
                    <p style="color: #f9f9f9; font-size: 16px; margin-top: 8px;">Mensagem submetida através do formulário de contacto</p>
                    </div>

                    <!-- Body -->
                    <div style="padding: 25px 20px; color: #2c3e50; background-color: #f9f9f9;">
                    <p style="font-size: 16px; margin-bottom: 15px;">
                        Olá equipa, OrdEat
                    </p>
                    <p style="font-size: 14px; margin-bottom: 25px;">
                        Foi submetido um novo contacto através do website. Aqui estão os detalhes do remetente:
                    </p>
                    
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                        <tr>
                        <td style="padding: 10px; border: 1px solid #ddd; background-color: #ffffff; font-weight: bold;">Nome:</td>
                        <td style="padding: 10px; border: 1px solid #ddd; background-color: #ffffff;">${name}</td>
                        </tr>
                        <tr>
                        <td style="padding: 10px; border: 1px solid #ddd; background-color: #ffffff; font-weight: bold;">Email:</td>
                        <td style="padding: 10px; border: 1px solid #ddd; background-color: #ffffff;">${email}</td>
                        </tr>
                    </table>

                    <p style="font-size: 14px; font-weight: bold; margin-bottom: 10px;">Mensagem:</p>
                    <div style="font-size: 14px; background-color: #ffffff; padding: 15px; border: 1px solid #ddd; border-radius: 5px; white-space: pre-line;">
                        ${message}
                    </div>

                    <p style="font-size: 13px; color: #7f8c8d; margin-top: 30px;">
                        Este contacto foi enviado automaticamente através do site OrdEat.
                    </p>
                    </div>

                    <!-- Footer -->
                    <div style="background-color: #ecf0f1; color: #95a5a6; text-align: center; font-size: 12px; padding: 15px;">
                    <p style="margin: 0;">Este é um e-mail automático do <strong>OrdEat</strong>. Por favor, não responda diretamente a este e-mail.</p>
                    </div>

                </div>
                `
        });

        res.json({ success: true });
    } catch (err) {
        console.error("Erro ao enviar email de contacto:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = contactController;