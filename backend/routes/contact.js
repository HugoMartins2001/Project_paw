const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// Rota para exibir o formulário de contato
router.post('/sendEmail', contactController.sendContactEmail);

module.exports = router;