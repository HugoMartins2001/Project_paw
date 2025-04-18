const Log = require("../models/log");
const mongoRestaurant = require("../models/restaurant");
const mongoUser = require("../models/user");
const mongoMenu = require("../models/menu");
const mongoDish = require("../models/dish");

const adminController = {};

// Controlador para exibir logs e estatísticas com filtros e paginação
adminController.viewLogs = async function (req, res, next) {
  try {
    const { action, userName, startDate, endDate, page = 1, limit = 10 } = req.query;

    // Construir o filtro
    const filter = {};
    if (action) filter.action = action;
    if (userName) filter.userName = { $regex: userName, $options: "i" };
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    // Paginação
    const skip = (page - 1) * limit;
    const logs = await Log.find(filter)
      .sort({ timestamp: -1 }) 
      .skip(skip)
      .limit(parseInt(limit));

    const totalLogs = await Log.countDocuments(filter); 
    const totalPages = Math.ceil(totalLogs / limit);

    // Apenas Admin pode ver os contadores
    let stats = {};
    if (req.user.role === "Admin") {
      stats = {
        restaurantsCount: await mongoRestaurant.countDocuments(),
        usersCount: await mongoUser.countDocuments(),
        menusCount: await mongoMenu.countDocuments(),
        dishesCount: await mongoDish.countDocuments(),
      };
    }

    res.render("admin/logs", {
      logs,
      stats,
      user: req.user,
      currentPage: parseInt(page),
      totalPages,
      filters: { action, userName, startDate, endDate },
    });
  } catch (err) {
    console.error("Error fetching logs:", err);
    next(err);
  }
};

// Controlador para excluir todos os logs
adminController.deleteAllLogs = async function (req, res, next) {
  try {
    await Log.deleteMany({});
    res.redirect("/admin/logs");
  } catch (error) {
    console.error("Error deleting all logs:", error);
    next(error);
  }
};

// Controlador para excluir um log específico
adminController.deleteLog = async function (req, res, next) {
  try {
    const logId = req.params.logId;
    await Log.findByIdAndDelete(logId);
    res.redirect("/admin/logs");
  } catch (error) {
    console.error("Error deleting log:", error);
    next(error);
  }
};

module.exports = adminController;