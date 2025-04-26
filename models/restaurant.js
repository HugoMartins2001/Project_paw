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
  restaurantEmail: {
    type: String,
    required: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "O email deve ser válido",
  },
  openingHours: {
    type: Map,
    of: {
      start: { type: String },
      end: { type: String },   
      closed: { type: Boolean, default: false }, 
    },
    required: true,
  },
  paymentMethods: {
    type: [String],
    required: true,
    enum: ["Cash", "Credit Card", "Debit Card", "Mobile Payment"], // Valores permitidos
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  menus: [{ type: mongoose.Schema.Types.ObjectId, ref: "Menu" }],
  isApproved: { type: Boolean, default: false },
  restaurantPic: { type: String },
  createdAt: { type: Date, default: Date.now },
  isVisible: { type: Boolean, default: true },
});

module.exports = mongoose.model("Restaurant", RestaurantSchema);
