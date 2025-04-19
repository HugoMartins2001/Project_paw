const logAction = require("../utils/logger");
const mongoOrder = require("../models/order");

let ordersController = {};

// Função para exibir o histórico de encomendas
ordersController.getOrdersHistory = async function (req, res, next) {
  try {
    const { restaurantName, startDate, endDate, page = 1 } = req.query;

    const user = req.user;

    // Configuração de paginação
    const ordersPerPage = 10;
    const skip = (page - 1) * ordersPerPage;

    // Construir o filtro de busca
    let filter = {};
    if (restaurantName) {
      filter.restaurantName = { $regex: restaurantName, $options: "i" }; // Busca por nome do restaurante (case insensitive)
    }
    if (startDate) {
      filter.date = { ...filter.date, $gte: new Date(startDate) };
    }
    if (endDate) {
      filter.date = { ...filter.date, $lte: new Date(endDate) };
    }

    // Buscar pedidos com base nos filtros e paginação
    const orders = await mongoOrder.find(filter).skip(skip).limit(ordersPerPage);
    const totalOrders = await mongoOrder.countDocuments(filter);
    const totalPages = Math.ceil(totalOrders / ordersPerPage);

    // Renderizar a página com os dados
    res.render("orders/ordersHistory", {
      orders,
      user,
      filters: { restaurantName, startDate, endDate },
      currentPage: parseInt(page),
      totalPages,
    });
  } catch (error) {
    console.error("Erro ao obter o histórico de encomendas:", error);
    next(error);
  }
};

// Função para exibir os detalhes de uma encomenda
ordersController.getOrderDetails = async function (req, res, next) {
  try {
    const orderId = req.params.orderId;

    // Buscar o pedido pelo ID
    const order = await mongoOrder.findById(orderId);

    if (!order) {
      return res.status(404).render("errors/404", { message: "Order not found." });
    }

    // Renderizar a página com os detalhes do pedido
    res.render("orders/orderDetails", { order });
  } catch (error) {
    console.error("Erro ao obter os detalhes da encomenda:", error);
    next(error);
  }
};

// Função para deletar uma encomenda
ordersController.deleteOrder = async function (req, res, next) {
  try {
    const orderId = req.params.orderId;

    // Buscar e deletar o pedido
    const order = await mongoOrder.findByIdAndDelete(orderId);

    if (!order) {
      return res.status(404).send("Order not found.");
    }

    logAction("Deleted Order", req.user, { orderId: order._id });

    res.redirect("/orders/history");
  } catch (error) {
    console.error("Erro ao deletar a encomenda:", error);
    next(error);
  }
};

module.exports = ordersController;