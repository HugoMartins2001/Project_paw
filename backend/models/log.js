const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  action: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String, required: true },
  role: { type: String, default: "Unknown Role" },
  timestamp: { type: Date, default: Date.now },
  details: { type: Object },
});

module.exports = mongoose.model("Log", logSchema);