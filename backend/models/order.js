const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  managerid: { type: String },
  userID: { type: String },
  items: Array,
  status: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);