const mongoUser = require('../models/user');

const registerCheckEmail = async (req, res, next) => {
    try {
        const existingUser = await mongoUser.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(409).json({ error: 'This email is already registered!' });
        }
        next(); // Prossegue para o próximo middleware ou controlador
    } catch (err) {
        next(err); // Passa o erro para o middleware de tratamento de erros
    }
};

module.exports = registerCheckEmail;