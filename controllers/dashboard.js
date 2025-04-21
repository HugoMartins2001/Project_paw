const dashboardController = {};

// Controlador para renderizar o dashboard
dashboardController.renderDashboard = async function (req, res, next) {
  try {
    const user = req.user; // Obtém o usuário autenticado da requisição (definido pelo middleware de autenticação)

    // Valida se o usuário está autenticado
    if (!user) {
      return res.status(401).send("Usuário não autenticado."); // Retorna erro 401 se o usuário não estiver autenticado
    }

    // Renderiza a página do dashboard e passa os dados do usuário para o template
    res.render("dashboard/dashboard", { user });
  } catch (err) {
    console.error("Error rendering dashboard:", err); // Loga o erro no console para depuração
    next(err); // Passa o erro para o middleware de tratamento de erros
  }
};

module.exports = dashboardController;