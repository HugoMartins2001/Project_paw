const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  action: { type: String, required: true }, // Ex.: "Created Restaurant", "Deleted Menu"
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Quem fez a ação
  userName: { type: String, required: true }, // Nome do usuário
  role: { type: String, default: "Unknown Role" }, // Papel do usuário (Admin, Manager, etc.)
  timestamp: { type: Date, default: Date.now }, // Quando a ação foi feita
  details: { type: Object }, // Detalhes adicionais (ex.: ID do restaurante, menu, etc.)
});

module.exports = mongoose.model("Log", logSchema);