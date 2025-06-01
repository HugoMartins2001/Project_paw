const mongoose = require('mongoose');
require('../models/user');
const Comment = require('../models/comment');
const Order = require('../models/order');

const commentController = {};

// Criar comentário (apenas se o user já fez encomenda no restaurante)
commentController.create = async function (req, res, next) {
    try {
        const userId = req.user._id;
        const { restaurantId, text } = req.body;

        const hasOrder = await Order.exists({ userID: userId, 'items.restaurantId': restaurantId });
        if (!hasOrder) {
            return res.status(403).json({ error: 'You can only comment on restaurants where you have ordered.' });
        }

        const comment = await Comment.create({ userId, restaurantId, text });
        res.json(comment);
    } catch (err) {
        res.status(500).json({ error: 'Error creating comment.' });
    }
};

// Listar comentários por restaurante
commentController.listByRestaurant = async function (req, res, next) {
    try {
        console.log('Listar comentários para restaurante:', req.params.id);
        const restaurantId = req.params.id;
        const comments = await Comment.find({ restaurantId: new mongoose.Types.ObjectId(restaurantId) }).populate('userId', 'name');
        res.json(comments);
    } catch (err) {
        console.error('Error fetching comments:', err);
        res.status(500).json({ error: 'Error fetching comments.' });
    }
};

module.exports = commentController;