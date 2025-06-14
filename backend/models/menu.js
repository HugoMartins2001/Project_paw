const mongoose = require("mongoose");

const MenuSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dishes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Dish" }],
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: false,
  },
  menuPic: {
    type: String,
    required: false,
  },
  createdAt: { type: Date, default: Date.now },
  isVisible: { type: Boolean, default: true },
});

module.exports = mongoose.model("Menu", MenuSchema);
