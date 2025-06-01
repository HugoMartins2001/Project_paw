const mongoUser = require('../models/user');

const registerCheckEmail = async (req, res, next) => {
    try {
        const existingUser = await mongoUser.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(409).json({ error: 'This email is already registered!' });
        }
        next(); 
    } catch (err) {
        next(err);
    }
};

module.exports = registerCheckEmail;