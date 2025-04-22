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
    enum: ["carne", "peixe", "sobremesa", "vegetariano"],
    required: true,
  },
  ingredients: { type: [String], required: true },
  nutrition: {
    calories: { type: Number },
    fat: { type: Number },
    protein: { type: Number },
    carbs: { type: Number },
  },
  nutriScore: { type: String, default: "N/A" },
  allergens: { type: [String], default: [] },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  dishPic: { type: String, required: false },
  isVisible: { type: Boolean, default: true }, // Campo para controlar visibilidade
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Dish", DishSchema);
