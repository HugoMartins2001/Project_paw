const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const ordersController = require('../controllers/orders');
const verifyJWT = require('../middlewares/verifyJWT');
const order = require('../models/order');

// Rota para exibir o histórico de encomendas
router.get('/ordersHistory', verifyJWT, function (req, res, next){
        ordersController.getOrdersHistory(req, res, next);    
});

router.get('/hasOrder', verifyJWT, ordersController.hasOrder);


// Rota para exibir os detalhes de uma encomenda
router.get('/:orderId', authController.verifyLoginUser, function (req, res, next) { 
     ordersController.getOrderDetails(req, res, next);
});

// Rota para apagar uma encomenda
router.delete('/:orderId/delete', authController.verifyLoginUser, function (req, res, next) {
      ordersController.deleteOrder(req, res, next);
});

// Exemplo de rota no backend (Express)
router.patch('/:orderId/status', verifyJWT, async (req, res) => {
  const { status } = req.body;
  const result = await order.findByIdAndUpdate(req.params.orderId, { status });
  if (!result) {
    return res.status(404).json({ message: 'Order not found' });
  }
  res.json({ success: true });
});

module.exports = router;