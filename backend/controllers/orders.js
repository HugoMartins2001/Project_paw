const logAction = require("../utils/logger");
const mongoOrder = require("../models/order");

let ordersController = {};


ordersController.getOrdersHistory = async function (req, res, next) {
  try {
    const { restaurantName, startDate, endDate, page = 1 } = req.query;
    const user = req.user;

    const ordersPerPage = 10;
    const skip = (page - 1) * ordersPerPage;

    let filter = {};

    if (req.user && req.user.role === 'manager') {
      filter['items.managerId'] = req.user._id;
    }


    if (req.user && req.user.role === 'client') {
      filter.userID = req.user._id;
    }

    if (restaurantName) {
      filter.restaurantName = { $regex: restaurantName, $options: "i" }; 
    }
    if (startDate) {
      filter.createdAt = { ...filter.createdAt, $gte: new Date(startDate) };
    }
    if (endDate) {
      filter.createdAt = { ...filter.createdAt, $lte: new Date(endDate) };
    }

    const orders = await mongoOrder.find(filter)
      .skip(skip)
      .limit(ordersPerPage)

    const totalOrders = await mongoOrder.countDocuments(filter);
    const totalPages = Math.ceil(totalOrders / ordersPerPage); 

    res.json({
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

ordersController.getOrderDetails = async function (req, res, next) {
  try {
    const orderId = req.params.orderId;

    // Buscar o pedido pelo ID
    const order = await mongoOrder.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found." }); 
    }

    res.json({ order });
  } catch (error) {
    console.error("Erro ao obter os detalhes da encomenda:", error);
    next(error); 
  }
};

ordersController.deleteOrder = async function (req, res, next) {
  try {
    const orderId = req.params.orderId; 

    const order = await mongoOrder.findByIdAndDelete(orderId);

    if (!order) {
      return res.status(404).send("Order not found."); 
    }

    logAction("Deleted Order", req.user, { orderId: order._id }); 

    res.redirect("/orders/history");
  } catch (error) {
    console.error("Erro ao eliminar a encomenda:", error);
    next(error); 
  }
};

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

ordersController.createOrder = async function (req, res) {
  try {
    const { order, managerID } = req.body;

    const userID = req.user._id;

    const newOrder = await mongoOrder.create({
      managerID: managerID || null,
      userID: userID,
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

ordersController.updateOrderStatus = async function (req, res, next) {
  try {
    const orderId = req.params.orderId;
    const { status } = req.body;

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