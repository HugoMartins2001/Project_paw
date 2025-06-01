const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment');
const authController = require("../controllers/auth");


router.post('/comments', authController.verifyLoginUser, commentController.create);

// Listar comentários de um restaurante
router.get('/:id', commentController.listByRestaurant);

module.exports = router;