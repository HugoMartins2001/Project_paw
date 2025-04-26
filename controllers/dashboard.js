const mongoRestaurant = require("../models/restaurant");
const mongoUser = require("../models/user");
const mongoMenu = require("../models/menu"); 
const mongoDish = require("../models/dish"); 
const mongoOrder = require("../models/order");


const dashboardController = {};

// Controlador para renderizar o dashboard
dashboardController.renderDashboard = async function (req, res, next) {
  try {
    const user = req.user; // Obtém o usuário autenticado da requisição

    // Valida se o usuário está autenticado
    if (!user) {
      return res.status(401).send("Usuário não autenticado."); // Retorna erro 401 se o usuário não estiver autenticado
    }

    // Renderiza a página do dashboard
    res.render("dashboard/dashboard", { user });
  } catch (err) {
    console.error("Error rendering dashboard:", err); // Loga o erro no console para depuração
    next(err); // Passa o erro para o middleware de tratamento de erros
  }
};

// Controlador para fornecer os dados do dashboard
dashboardController.getDashboardData = async function (req, res, next) {
  try {
    // Verifica se o usuário é administrador
    if (req.user.role !== "Admin") {
      return res.status(403).send("Acesso negado. Apenas administradores podem visualizar esses dados.");
    }

    // Agrupar restaurantes criados por mês
    const restaurantsByMonth = await mongoRestaurant.aggregate([
      {
        $match: { createdAt: { $exists: true, $ne: null } } // Garante que o campo createdAt existe
      },
      {
        $group: {
          _id: { $month: "$createdAt" }, // Agrupa por mês
          count: { $sum: 1 }, // Conta o número de restaurantes
        },
      },
      { $sort: { _id: 1 } }, // Ordena por mês
    ]);

    // Agrupar usuários registrados por mês
    const usersByMonth = await mongoUser.aggregate([
      {
        $match: { createdAt: { $exists: true, $ne: null } } // Garante que o campo createdAt existe
      },
      {
        $group: {
          _id: { $month: "$createdAt" }, // Agrupa por mês
          count: { $sum: 1 }, // Conta o número de usuários
        },
      },
      { $sort: { _id: 1 } }, // Ordena por mês
    ]);

    // Agrupar menus criados por mês
    const menusByMonth = await mongoMenu.aggregate([
      {
        $match: { createdAt: { $exists: true, $ne: null } } // Garante que o campo createdAt existe
      },
      {
        $group: {
          _id: { $month: "$createdAt" }, // Agrupa por mês
          count: { $sum: 1 }, // Conta o número de menus
        },
      },
      { $sort: { _id: 1 } }, // Ordena por mês
    ]);

    // Agrupar pratos criados por mês
    const dishesByMonth = await mongoDish.aggregate([
      {
        $match: { createdAt: { $exists: true, $ne: null } } // Garante que o campo createdAt existe
      },
      {
        $group: {
          _id: { $month: "$createdAt" }, // Agrupa por mês
          count: { $sum: 1 }, // Conta o número de pratos
        },
      },
      { $sort: { _id: 1 } }, // Ordena por mês
    ]);

    // Agrupar orders criadas por mês
    const ordersByMonth = await mongoOrder.aggregate([
      {
        $match: { createdAt: { $exists: true, $ne: null } } // Garante que o campo createdAt existe
      },
      {
        $group: {
          _id: { $month: "$createdAt" }, // Agrupa por mês
          count: { $sum: 1 }, // Conta o número de orders
        },
      },
      { $sort: { _id: 1 } }, // Ordena por mês
    ]);

    // Converter os dados para um formato utilizável no gráfico
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const restaurantData = Array(12).fill(0);
    const userData = Array(12).fill(0);
    const menuData = Array(12).fill(0);
    const dishData = Array(12).fill(0);
    const orderData = Array(12).fill(0);

    restaurantsByMonth.forEach((item) => {
      restaurantData[item._id - 1] = item.count; // Preenche os dados no índice correto
    });

    usersByMonth.forEach((item) => {
      userData[item._id - 1] = item.count; // Preenche os dados no índice correto
    });

    menusByMonth.forEach((item) => {
      menuData[item._id - 1] = item.count; // Preenche os dados no índice correto
    });

    dishesByMonth.forEach((item) => {
      dishData[item._id - 1] = item.count; // Preenche os dados no índice correto
    });

    ordersByMonth.forEach((item) => {
      orderData[item._id - 1] = item.count; // Preenche os dados no índice correto
    });

    // Retorna os dados como JSON
    res.json({ months, restaurantData, userData, menuData, dishData, orderData });
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).send("Error fetching dashboard data");
  }
};

module.exports = dashboardController;