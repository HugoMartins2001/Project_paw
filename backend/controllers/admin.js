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

    const filter = {};
    if (action) filter.action = action;
    if (userName) filter.userName = { $regex: userName, $options: "i" };


    if (startDate || endDate) {
      const timestampFilter = {};
      if (startDate && !isNaN(Date.parse(startDate))) {
        timestampFilter.$gte = new Date(startDate);
      }
      if (endDate && !isNaN(Date.parse(endDate))) {
        timestampFilter.$lte = new Date(endDate);
      }
      if (Object.keys(timestampFilter).length > 0) {
        filter.timestamp = timestampFilter;
      }
    }

    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;

    const skip = (pageNumber - 1) * limitNumber;

    const logs = await Log.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limitNumber);

    const totalLogs = await Log.countDocuments(filter);
    const totalPages = Math.ceil(totalLogs / limitNumber); 

    let stats = {};
    if (req.user.role === "Admin") {
      stats = {
        restaurantsCount: await mongoRestaurant.countDocuments(),
        usersCount: await mongoUser.countDocuments(), 
        menusCount: await mongoMenu.countDocuments(), 
        dishesCount: await mongoDish.countDocuments(), 
      };
    }

    res.json({
      logs,
      stats,
      user: req.user,
      currentPage: pageNumber,
      totalPages,
      filters: {
        action: action || '',
        userName: userName || '',
        startDate: startDate || '',
        endDate: endDate || '',
      },
    });
  } catch (err) {
    console.error("Error fetching logs:", err);
    next(err); 
  }
};

// Controlador para excluir todas os logs
adminController.deleteAllLogs = async function (req, res, next) {
  try {
    await Log.deleteMany({});
    res.json({ message: "All logs deleted successfully" }); 
  } catch (error) {
    console.error("Error deleting all logs:", error);
    next(error);
  }
};

// Controlador para excluir uma log específica
adminController.deleteLog = async function (req, res, next) {
  try {
    const logId = req.params.logId; 
    await Log.findByIdAndDelete(logId);
    res.json({ message: "Log deleted successfully" }); 
  } catch (error) {
    console.error("Error deleting log:", error); 
    next(error); 
  }
};

module.exports = adminController;