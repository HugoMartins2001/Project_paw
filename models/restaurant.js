const mongoose = require("mongoose");

const RestaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: {
    type: String,
    required: true,
    match: /^[0-9]{9}$/,
    message: "O telefone deve conter exatamente 9 dígitos numéricos",
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "O email deve ser válido",
  },
  openingHours: { type: String, required: true },
  paymentMethods: { type: String, required: true },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  menus: [{ type: mongoose.Schema.Types.ObjectId, ref: "Menu" }],
  isApproved: { type: Boolean, default: false },
  restaurantPic: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Restaurant", RestaurantSchema);
