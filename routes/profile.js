const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

router.get('/profile', authController.verifyLoginUser, (req, res) => {
    if (!req.user) {
        return res.redirect('/auth/login');
    }
    res.render('profile', { user: req.user });
});

module.exports = router;