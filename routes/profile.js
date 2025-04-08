const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const profile = require('../controllers/profile');

router.use(authController.verifyLoginUser);

router.get('/', (req, res) => {
    res.render('dashboard/profile', { user: req.user });
});

router.get('/editProfile', profile.editProfile);

router.post('/editProfile', profile.updateProfile);

module.exports = router;