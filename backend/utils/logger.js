const Log = require("../models/log");

async function logAction(action, user, details = {}) {
  try {
    await Log.create({
      action,
      userId: user._id,
      userName: user.name || "Unknown User",
      role: user.role || "Unknown Role",
      details,
      timestamp: new Date(), 
    });
  } catch (err) {
    console.error("Error logging action:", err);
  }
}

module.exports = logAction;