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
    // Dados de exemplo para os gráficos
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const restaurantData = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
    const userData = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24];

    // Retorna os dados como JSON
    res.json({ months, restaurantData, userData });
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).send("Error fetching dashboard data");
  }
};

module.exports = dashboardController;