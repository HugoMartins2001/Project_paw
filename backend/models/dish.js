const mongoose = require("mongoose");

const DishSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  prices: {
    pequena: { type: Number, required: true, default: 0 },
    media: { type: Number, required: true, default: 0 },
    grande: { type: Number, required: true, default: 0 },
  },
  category: {
    type: String,
    required: true,
  },
  ingredients: { type: [String], required: true },
  nutrition: {
    calories: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
  },
  nutriScore: {
    type: String,
    enum: ["A", "B", "C", "D", "E", "N/A"],
    default: "N/A",
  },
  allergens: { type: [String], default: [] },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  dishPic: { type: String, required: false },
  isVisible: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Dish", DishSchema);
