const mongoose = require("mongoose");

const RestaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: {
    type: String,
    required: true,
    match: /^[0-9]{9}$/,
    message: "Phone number must be 9 digits long",
  },
  restaurantEmail: {
    type: String,
    required: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Invalid email format",
  },
  openingHours: {
    type: Object,
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
    enum: ["Cash", "Credit Card", "Debit Card", "Mobile Payment"],
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  confessionTime: {
    type: Number,
    required: true,
    min: 1,
  },
  deliveryTime: {
    type: Number,
    required: true,
    min: 1,
  },
  menus: [{ type: mongoose.Schema.Types.ObjectId, ref: "Menu" }],
  isApproved: { type: Boolean, default: false },
  restaurantPic: { type: String },
  createdAt: { type: Date, default: Date.now },
  isVisible: { type: Boolean, default: true },
});

module.exports = mongoose.model("Restaurant", RestaurantSchema);
