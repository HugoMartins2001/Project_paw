const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const verifyJWT = require('../middlewares/verifyJWT'); // garantir que só logados veem

// Adiciona depois de verifyJWT
function onlyAdmins(req, res, next) {
    if (req.user.role === 'admin') {
        next();
    } else {
        res.status(403).send('Acesso negado');
    }
}

// E na rota:
router.get('/showUsers', verifyJWT, onlyAdmins, usersController.showUsers);


module.exports = router;
