const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  managerId: { type: String },
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  items: Array,
  status: String,
  createdAt: { type: Date, default: Date.now },
  discountApplied: { type: Boolean, default: false },
  discountPercent: { type: Number, default: 0 }
});

module.exports = mongoose.model('Order', orderSchema);