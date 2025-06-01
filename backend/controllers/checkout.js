const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe('sk_test_51RPu2TJukWqsizzmdimBlqYLxjCm0mHnNDQDFhlH2K4vG02xY3SMzJJbE9NeOt9WJp295M88M3fRZLvJ2d60kLik00dlXY215T');
const mongoOrder = require('../models/order');

let checkoutController = {}

const addMonths = (date, months) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

checkoutController.createCheckoutSession = async (req, res) => {
  const { cart, managerId, userID, discountApplied, discountPercent, userName } = req.body;
  try {
    const newOrder = await mongoOrder.create({
      managerId: managerId || null,
      userID: userID || null,
      items: cart.map(item => ({
        ...item,
        originalPrice: item.originalPrice ?? item.price
      })),
      status: 'pending',
      createdAt: new Date(),
      discountApplied: discountApplied || false,
      discountPercent: discountPercent || 0
    });

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
      success_url: 'http://localhost:4200/client/home?paid=1',
      cancel_url: `http://localhost:4200/payment-cancel?orderId=${newOrder._id.toString()}`,
      metadata: {
        orderId: newOrder._id.toString()
      }
    });

    const io = req.app.get('io');
    const notification = {
      message: `
        <div style="font-size:1.08em;">
          <b>New order</b> from <span style="color:#0d6efd;"><b>${userName || 'Cliente'}</b></span>
        </div>
        <div style="margin-top:4px;">
          <span style="color:#444;"><b>Total:</b> ${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)} €</span>
        </div>
        <div style="color:#444;"><b>Items:</b> ${cart.map(item => `${item.quantity}x ${item.name}`).join(', ')}</div>
        <div style="margin-top:8px;">
          <a href="/orders/manager" 
             style="display:inline-block;padding:4px 12px;background:#0d6efd;color:#fff;border-radius:4px;text-decoration:none;font-size:0.97em;">
            View order
          </a>
        </div>
      `,
      orderId: newOrder._id,
      total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2),
      items: cart.map(item => `${item.quantity}x ${item.name}`).join(', '),
      createdAt: newOrder.createdAt
    };

    io.emit('newOrder', notification);

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

checkoutController.success = (req, res) => {
  res.json('Payment completed successfully!');
};

checkoutController.cancel = (req, res) => {
  res.json('Payment canceled.');
};

checkoutController.cancelOrder = async (req, res) => {
  const { orderId, userID } = req.body;
  try {
    const order = await mongoOrder.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const now = new Date();
    const createdAt = new Date(order.createdAt);
    const diffMinutes = (now - createdAt) / (1000 * 60);
    if (diffMinutes > 5) {
      return res.status(400).json({ error: 'Already pass more than 5 minutes. Cannot cancel.' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Preparation has already started. Cannot cancel.' });
    }

    order.status = 'cancelled';
    await order.save();

    await mongoOrder.updateOne(
      { _id: orderId },
      { $set: { cancelledAt: now } }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = checkoutController;