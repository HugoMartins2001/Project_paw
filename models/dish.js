const mongoose = require("mongoose");

const DishSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  prices: {
    pequena: { type: Number, required: true },
    media: { type: Number, required: true },
    grande: { type: Number, required: true },
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
});

module.exports = mongoose.model("Dish", DishSchema);
