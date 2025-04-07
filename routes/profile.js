const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const profile = require('../controllers/profile');

router.use(authController.verifyLoginUser);

// Ver perfil
router.get('/', (req, res) => {
    res.render('dashboard/profile', { user: req.user });  // <== view certa
});

// Editar perfil (GET)
router.get('/editProfile', profile.editProfile);

// Editar perfil (POST)
router.post('/editProfile', profile.updateProfile);

module.exports = router;
