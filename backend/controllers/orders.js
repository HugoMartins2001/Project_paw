const logAction = require("../utils/logger");
const mongoOrder = require("../models/order");

let ordersController = {};

// Função para exibir o histórico de encomendas
ordersController.getOrdersHistory = async function (req, res, next) {
  try {
    const { restaurantName, startDate, endDate, page = 1 } = req.query;
    const user = req.user;

    // Configuração de paginação
    const ordersPerPage = 10; // Define o número de pedidos por página
    const skip = (page - 1) * ordersPerPage; // Calcula quantos pedidos pular com base na página atual

    // Construir o filtro de busca
    let filter = {};

    // Se for manager, filtra pelas encomendas que têm pratos dele
    if (req.user && req.user.role === 'manager') {
      filter['items.managerId'] = req.user._id;
    }

    // Se for cliente, filtra pelas encomendas dele
    if (req.user && req.user.role === 'client') {
      filter.userID = req.user._id;
    }

    if (restaurantName) {
      filter.restaurantName = { $regex: restaurantName, $options: "i" }; // Busca por nome do restaurante (case insensitive)
    }
    if (startDate) {
      filter.createdAt = { ...filter.createdAt, $gte: new Date(startDate) }; // Filtra pedidos com data maior ou igual ao startDate
    }
    if (endDate) {
      filter.createdAt = { ...filter.createdAt, $lte: new Date(endDate) }; // Filtra pedidos com data menor ou igual ao endDate
    }

    // Buscar pedidos com base nos filtros e paginação
    const orders = await mongoOrder.find(filter).skip(skip).limit(ordersPerPage);
    const totalOrders = await mongoOrder.countDocuments(filter); // Conta o total de pedidos que atendem ao filtro
    const totalPages = Math.ceil(totalOrders / ordersPerPage); // Calcula o total de páginas

    // jsonizar a página com os dados
    res.json({
      orders,
      user,
      filters: { restaurantName, startDate, endDate },
      currentPage: parseInt(page),
      totalPages,
    });
  } catch (error) {
    console.error("Erro ao obter o histórico de encomendas:", error);
    next(error); // Passa o erro para o middleware de tratamento de erros
  }
};

// Função para exibir os detalhes de uma encomenda
ordersController.getOrderDetails = async function (req, res, next) {
  try {
    const orderId = req.params.orderId; // Obtém o ID do pedido a partir dos parâmetros da URL

    // Buscar o pedido pelo ID
    const order = await mongoOrder.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found." }); // Retorna erro 404 se o pedido não for encontrado
    }

    // jsonizar a página com os detalhes do pedido
    res.json({ order });
  } catch (error) {
    console.error("Erro ao obter os detalhes da encomenda:", error);
    next(error); // Passa o erro para o middleware de tratamento de erros
  }
};

// Função para deletar uma encomenda
ordersController.deleteOrder = async function (req, res, next) {
  try {
    const orderId = req.params.orderId; // Obtém o ID do pedido a partir dos parâmetros da URL

    // Buscar e deletar o pedido
    const order = await mongoOrder.findByIdAndDelete(orderId);

    if (!order) {
      return res.status(404).send("Order not found."); // Retorna erro 404 se o pedido não for encontrado
    }

    logAction("Deleted Order", req.user, { orderId: order._id }); // Registra a ação de exclusão no log

    res.redirect("/orders/history"); // Redireciona para a página de histórico de encomendas
  } catch (error) {
    console.error("Erro ao eliminar a encomenda:", error);
    next(error); // Passa o erro para o middleware de tratamento de erros
  }
};

// Função para completar uma encomenda
ordersController.completeOrder = async function (req, res, next) {
  try {
    const orderId = req.params.orderId;
    const order = await mongoOrder.findByIdAndUpdate(orderId, { status: 'completed' }, { new: true });

    if (!order) {
      return res.status(404).send("Order not found.");
    }

    const io = req.app.get('io');
    io.emit('orderCompleted', { orderId: order._id, user: order.user, status: order.status });

    res.json({ message: 'Order completed!', order });
  } catch (error) {
    next(error);
  }
};

// Função para criar uma nova encomenda
ordersController.createOrder = async function (req, res) {
  try {
    const { order, managerID } = req.body;

    // Obtém o userID do utilizador autenticado (middleware JWT)
    const userID = req.user._id;

    // Cria o documento da encomenda com userID
    const newOrder = await mongoOrder.create({
      managerID: managerID || null,
      userID: userID, // <-- adiciona isto!
      items: order,
      status: 'pending',
      createdAt: new Date()
    });

    const io = req.app.get('io');
    io.emit('orderCreated', { message: 'Nova encomenda recebida!', order: newOrder });

    res.status(201).json({ success: true, order: newOrder });
  } catch (error) {
    console.error("Erro ao criar encomenda:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Função para atualizar o status de uma encomenda
ordersController.updateOrderStatus = async function (req, res, next) {
  try {
    const orderId = req.params.orderId;
    const { status } = req.body;

    // Só permite alterar para estados válidos
    const validStatuses = ['pending', 'expedida', 'entregue'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Estado inválido.' });
    }

    const order = await mongoOrder.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Encomenda não encontrada.' });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error("Erro ao atualizar estado da encomenda:", error);
    next(error);
  }
};

module.exports = ordersController;