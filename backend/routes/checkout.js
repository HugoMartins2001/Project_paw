const express = require("express");
const router = express.Router();
const checkoutController = require("../controllers/checkout");

// Middleware para verificar se o utilizador está autenticado
router.post("/createCheckoutSession", checkoutController.createCheckoutSession);

// Rota para processar o pagamento com Stripe
router.get("/success", checkoutController.success);

// Rota para processar o cancelamento do pagamento
router.post('/cancel-order', checkoutController.cancelOrder);

module.exports = router;
