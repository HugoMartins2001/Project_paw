const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const ordersController = require('../controllers/orders');

// Rota para exibir o histórico de encomendas
router.get('/ordersHistory',authController.verifyLoginUser, function (req, res, next){
        ordersController.getOrdersHistory(req, res, next);    
});

// Rota para exibir os detalhes de uma encomenda
router.get('/:orderId', authController.verifyLoginUser, function (req, res, next) { 
     ordersController.getOrderDetails(req, res, next);
});

// Rota para deletar uma encomenda
router.post('/:orderId/delete', authController.verifyLoginUser, function (req, res, next) {
      ordersController.deleteOrder(req, res, next);
});

module.exports = router;