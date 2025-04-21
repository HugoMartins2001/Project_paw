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

    // Construir o filtro para a consulta no banco de dados
    const filter = {};
    if (action) filter.action = action; // Filtrar logs por ação específica
    if (userName) filter.userName = { $regex: userName, $options: "i" }; // Filtrar por nome de usuário (case insensitive)

    // Validar e adicionar intervalo de datas ao filtro
    if (startDate || endDate) {
      const timestampFilter = {};
      if (startDate && !isNaN(Date.parse(startDate))) {
        timestampFilter.$gte = new Date(startDate); // Data inicial (maior ou igual)
      }
      if (endDate && !isNaN(Date.parse(endDate))) {
        timestampFilter.$lte = new Date(endDate); // Data final (menor ou igual)
      }
      if (Object.keys(timestampFilter).length > 0) {
        filter.timestamp = timestampFilter; // Adicionar filtro de intervalo de datas
      }
    }

    // Garantir que `page` e `limit` sejam números válidos
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;

    // Calcular o número de documentos a pular para a paginação
    const skip = (pageNumber - 1) * limitNumber;

    // Buscar logs no banco de dados com filtros, ordenação e paginação
    const logs = await Log.find(filter)
      .sort({ timestamp: -1 }) // Ordenar por timestamp em ordem decrescente
      .skip(skip) // Pular documentos para a página atual
      .limit(limitNumber); // Limitar o número de documentos retornados

    // Contar o total de logs que atendem ao filtro
    const totalLogs = await Log.countDocuments(filter);
    const totalPages = Math.ceil(totalLogs / limitNumber); // Calcular o total de páginas

    // Apenas Admin pode ver os contadores de estatísticas
    let stats = {};
    if (req.user.role === "Admin") {
      stats = {
        restaurantsCount: await mongoRestaurant.countDocuments(), // Total de restaurantes
        usersCount: await mongoUser.countDocuments(), // Total de usuários
        menusCount: await mongoMenu.countDocuments(), // Total de menus
        dishesCount: await mongoDish.countDocuments(), // Total de pratos
      };
    }

    // Renderizar a página de logs com os dados obtidos
    res.render("admin/logs", {
      logs,
      stats,
      user: req.user,
      currentPage: pageNumber,
      totalPages,
      filters: {
        action: action || '', // Garante que seja uma string vazia se não houver filtro
        userName: userName || '', // Garante que seja uma string vazia se não houver filtro
        startDate: startDate || '', // Garante que seja uma string vazia se não houver filtro
        endDate: endDate || '', // Garante que seja uma string vazia se não houver filtro
      },
    });
  } catch (err) {
    console.error("Error fetching logs:", err); // Logar o erro no console
    next(err); // Passar o erro para o middleware de tratamento de erros
  }
};

// Controlador para excluir todos os logs
adminController.deleteAllLogs = async function (req, res, next) {
  try {
    await Log.deleteMany({}); // Excluir todos os documentos da coleção de logs
    res.redirect("/admin/logs"); // Redirecionar para a página de logs
  } catch (error) {
    console.error("Error deleting all logs:", error); // Logar o erro no console
    next(error); // Passar o erro para o middleware de tratamento de erros
  }
};

// Controlador para excluir um log específico
adminController.deleteLog = async function (req, res, next) {
  try {
    const logId = req.params.logId; // Obter o ID do log a ser excluído
    await Log.findByIdAndDelete(logId); // Excluir o log pelo ID
    res.redirect("/admin/logs"); // Redirecionar para a página de logs
  } catch (error) {
    console.error("Error deleting log:", error); // Logar o erro no console
    next(error); // Passar o erro para o middleware de tratamento de erros
  }
};

module.exports = adminController;