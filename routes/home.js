const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

router.get('/', authController.verifyLoginUser, (req, res) => {
    if (!req.user) {
        return res.redirect('/auth/login');
    }
    res.render('home/home', { user: req.user });
});


module.exports = router;