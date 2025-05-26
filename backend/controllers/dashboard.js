const mongoRestaurant = require("../models/restaurant");
const mongoUser = require("../models/user");
const mongoMenu = require("../models/menu"); 
const mongoDish = require("../models/dish"); 
const mongoOrder = require("../models/order");


const dashboardController = {};

// Controlador para renderizar o dashboard
dashboardController.renderDashboard = async function (req, res, next) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Utilizador não autenticado." });
    }

    res.json({ user });
  } catch (err) {
    console.error("Error rendering dashboard:", err); 
  }
};

// Controlador para fornecer os dados do dashboard
dashboardController.getDashboardData = async function (req, res, next) {
  try {

    // Agrupar restaurantes criados por mês
    const restaurantsByMonth = await mongoRestaurant.aggregate([
      {
        $match: { createdAt: { $exists: true, $ne: null } } 
      },
      {
        $group: {
          _id: { $month: "$createdAt" }, 
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Agrupar usuários registrados por mês
    const usersByMonth = await mongoUser.aggregate([
      {
        $match: { createdAt: { $exists: true, $ne: null } }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } }, 
    ]);

    // Agrupar menus criados por mês
    const menusByMonth = await mongoMenu.aggregate([
      {
        $match: { createdAt: { $exists: true, $ne: null } } 
      },
      {
        $group: {
          _id: { $month: "$createdAt" }, 
          count: { $sum: 1 }, 
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Agrupar pratos criados por mês
    const dishesByMonth = await mongoDish.aggregate([
      {
        $match: { createdAt: { $exists: true, $ne: null } } 
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }, 
        },
      },
      { $sort: { _id: 1 } }, 
    ]);

    // Agrupar orders criadas por mês
    const ordersByMonth = await mongoOrder.aggregate([
      {
        $match: { createdAt: { $exists: true, $ne: null } } 
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }, 
        },
      },
      { $sort: { _id: 1 } }, 
    ]);

    // Converter os dados para um formato utilizável no gráfico
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const restaurantData = Array(12).fill(0);
    const userData = Array(12).fill(0);
    const menuData = Array(12).fill(0);
    const dishData = Array(12).fill(0);
    const orderData = Array(12).fill(0);

    restaurantsByMonth.forEach((item) => {
      restaurantData[item._id - 1] = item.count;
    });

    usersByMonth.forEach((item) => {
      userData[item._id - 1] = item.count; 
    });

    menusByMonth.forEach((item) => {
      menuData[item._id - 1] = item.count; 
    });

    dishesByMonth.forEach((item) => {
      dishData[item._id - 1] = item.count; 
    });

    ordersByMonth.forEach((item) => {
      orderData[item._id - 1] = item.count;
    });

    res.json({ months, restaurantData, userData, menuData, dishData, orderData });
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).json({ error: "Error fetching dashboard data" }); 
  }
};

module.exports = dashboardController;