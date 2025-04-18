const Log = require("../models/log");
const mongoRestaurant = require("../models/restaurant");
const mongoUser = require("../models/user");
const mongoMenu = require("../models/menu");
const mongoDish = require("../models/dish");

const adminController = {};

// Controlador para exibir logs e estatísticas
adminController.viewLogs = async function (req, res, next) {
  try {

    const user = req.user;
    // Buscar os logs mais recentes
    const logs = await Log.find().sort({ timestamp: -1 }).limit(100); // Exibe os 100 logs mais recentes

    // Apenas Admin pode ver os contadores
    let stats = {};
    if (user.role === "Admin") {
      stats = {
        restaurantsCount: await mongoRestaurant.countDocuments(),
        usersCount: await mongoUser.countDocuments(),
        menusCount: await mongoMenu.countDocuments(),
        dishesCount: await mongoDish.countDocuments(),
      };
    }

    res.render("admin/logs", { logs, stats, user: req.user });
  } catch (err) {
    console.error("Error fetching logs:", err);
    next(err);
  }
};

module.exports = adminController;