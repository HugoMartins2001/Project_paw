const mongoRestaurant = require("../models/restaurant");
const mongoUser = require("../models/user");

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

    // Converter os dados para um formato utilizável no gráfico
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const restaurantData = Array(12).fill(0);
    const userData = Array(12).fill(0);

    restaurantsByMonth.forEach((item) => {
      restaurantData[item._id - 1] = item.count; // Preenche os dados no índice correto
    });

    usersByMonth.forEach((item) => {
      userData[item._id - 1] = item.count; // Preenche os dados no índice correto
    });

    // Retorna os dados como JSON
    res.json({ months, restaurantData, userData });
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).send("Error fetching dashboard data");
  }
};

module.exports = dashboardController;