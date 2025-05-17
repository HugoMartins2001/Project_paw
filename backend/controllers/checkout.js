const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe('sk_test_51RPu2TJukWqsizzmdimBlqYLxjCm0mHnNDQDFhlH2K4vG02xY3SMzJJbE9NeOt9WJp295M88M3fRZLvJ2d60kLik00dlXY215T'); 

let checkoutController = {}

checkoutController.createCheckoutSession = async (req, res) => {
  const { cart } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: cart.map(item => ({
        price_data: {
          currency: 'eur',
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity || 1,
      })),
      mode: 'payment',
      success_url: 'http://localhost:4200/success',
      cancel_url: 'http://localhost:4200/cancel',
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

checkoutController.success = (req, res) => {
  res.json('Pagamento concluído com sucesso!');
};

checkoutController.cancel = (req, res) => {
  res.json('Pagamento cancelado.');
};

module.exports = checkoutController;