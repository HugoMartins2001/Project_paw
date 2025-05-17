require('dotenv').config(); // Carrega as variáveis do .env


const mongoRestaurant = require("../models/restaurant");
const mongoMenu = require("../models/menu");
const logAction = require("../utils/logger");
const nodemailer = require('nodemailer');
const mongoUser = require("../models/user");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

let restaurantsController = {};

// Função auxiliar para processar os horários de funcionamento
function processOpeningHours(openingHours) {
  const processedOpeningHours = {};
  const defaultHours = openingHours.default;

  for (const day in openingHours) {
    if (day === "default") continue;

    // Aceita booleano ou string
    if (openingHours[day].closed === true || openingHours[day].closed === "true") {
      processedOpeningHours[day] = { closed: true };
    } else {
      processedOpeningHours[day] = {
        start: openingHours[day].start || defaultHours.start,
        end: openingHours[day].end || defaultHours.end,
        closed: false,
      };
    }
  }

  processedOpeningHours.default = defaultHours;
  return processedOpeningHours;
}

// Middleware para processar os horários antes de criar um restaurante
restaurantsController.processCreateRestaurant = function (req, res, next) {
  try {
    if (req.body.openingHours) {
      req.body.openingHours = processOpeningHours(req.body.openingHours);
    }
    next();
  } catch (err) {
    console.error("Error processing opening hours:", err);
    next(err);
  }
};

// Middleware para processar os horários antes de atualizar um restaurante
restaurantsController.processUpdateRestaurant = function (req, res, next) {
  try {
    if (req.body.openingHours) {
      // Faz o parse se vier como string
      let openingHours = req.body.openingHours;
      if (typeof openingHours === 'string') {
        try {
          openingHours = JSON.parse(openingHours);
        } catch (e) {
          return res.status(400).json({ error: 'Formato de horários inválido.' });
        }
      }
      req.body.openingHours = processOpeningHours(openingHours);
    }
    next();
  } catch (err) {
    console.error("Error processing opening hours:", err);
    next(err);
  }
};

// Controlador para exibir todos os restaurantes
restaurantsController.showAll = async function (req, res, next) {
  if (!req.user) return res.redirect("/auth/login"); // Redireciona para login se o usuário não estiver autenticado

  try {
    const {
      page = 1,
      limit = 6,
      name,
      address,
      sortBy = "name",
      order = "asc"
    } = req.query; // Parâmetros de filtro e ordenação

    const skip = (page - 1) * limit;

    // Construir o filtro de busca
    let query = {};

    // Filtrar por nome do restaurante
    if (name) {
      query.name = { $regex: name, $options: "i" }; // Busca por nome (case insensitive)
    }

    // Filtrar por localização
    if (address) {
      query.address = { $regex: address, $options: "i" }; // Busca por localização (case insensitive)
    }

    // Filtrar restaurantes com base no papel do usuário
    if (req.user?.role === "Manager") {
      query.managerId = req.user._id; // Gerentes só podem ver seus próprios restaurantes
    } else if (req.user?.role === "Client") {
      query.isApproved = true; // Clientes só podem ver restaurantes aprovados
      query.isVisible = true; // Clientes só podem ver restaurantes visíveis
    }

    // Ordenação
    const sortOrder = order === "desc" ? -1 : 1; // Ordem ascendente ou descendente
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;

    // Buscar restaurantes com base no filtro e aplicar paginação e ordenação
    const restaurantList = await mongoRestaurant
      .find(query)
      .populate("menus") // Popula os menus associados ao restaurante
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Total de restaurantes para paginação
    const totalRestaurants = await mongoRestaurant.countDocuments(query);
    const totalPages = Math.ceil(totalRestaurants / limit);

    const filteredRestaurants = restaurantList.map((restaurant) => {
      const filteredMenus = restaurant.menus.filter((menu) => {
        // Administradores podem ver todos os menus
        if (req.user.role === "Admin") {
          return true;
        }

        // Gerentes só podem ver menus que eles criaram
        return menu.managerId.toString() === req.user._id.toString();
      });

      return {
        ...restaurant.toObject(),
        menus: filteredMenus,
      };
    });

    // Retornar os restaurantes como JSON
    res.json({
      restaurants: filteredRestaurants,
      user: req.user,
      currentPage: parseInt(page),
      totalPages,
      filters: { name, address, sortBy, order },
    });

  } catch (err) {
    console.error("Error fetching restaurants:", err);
    next(err);
  }
};

// Controlador para exibir os detalhes de um restaurante
restaurantsController.showDetails = function (req, res, next) {
  const query =
    req.user.role === "Manager"
      ? { name: req.params.name, managerId: req.user._id }
      : { name: req.params.name };

  mongoRestaurant
    .findOne(query)
    .populate("menus")
    .then(function (restaurantDB) {
      if (!restaurantDB) {
        return res.status(404).json({ message: "Restaurant not found." });
      }

      // Permissões:
      // - Admin pode ver tudo
      // - Manager só vê os seus
      // - Client só vê restaurantes aprovados e visíveis
      if (
        req.user.role === "Manager" &&
        (!restaurantDB.managerId || restaurantDB.managerId.toString() !== req.user._id.toString())
      ) {
        return res.status(403).json({ message: "Access denied." });
      }
      if (
        req.user.role === "Client" &&
        (!restaurantDB.isApproved || restaurantDB.isVisible === false)
      ) {
        return res.status(403).json({ message: "Access denied." });
      }

      // Filtrar menus conforme o papel
      let filteredMenus = restaurantDB.menus;
      if (req.user.role === "Manager") {
        filteredMenus = restaurantDB.menus.filter(
          (menu) => menu.managerId.toString() === req.user._id.toString()
        );
      }

      const inputs = {
        restaurant: {
          ...restaurantDB.toObject(),
          menus: filteredMenus,
        },
        user: req.user,
      };
      res.json(inputs);
    })
    .catch(function (err) {
      console.error("Error fetching restaurant details:", err);
      next(err);
    });
};

restaurantsController.renderCreateRestaurant = async function (req, res, next) {
  try {
    let menus;

    if (req.user.role === "Manager") {
      menus = await mongoMenu.find({ managerId: req.user._id });
    } else {
      menus = await mongoMenu.find();
    }

    res.json("restaurants/submitRestaurant", {
      menus,
      user: req.user, // Passa o usuário logado para o EJS
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// Controlador para criar um restaurante
restaurantsController.createRestaurant = async function (req, res, next) {
  const managerId = req.user._id;
  const restaurantPic = req.file ? req.file.filename : null;

  try {
    // Verificar se já existe um restaurante com o mesmo email para outro gerente
    const existingRestaurant = await mongoRestaurant.findOne({
      restaurantEmail: req.body.restaurantEmail,
      managerId: { $ne: managerId }, // Verifica se o email pertence a outro gerente
    });

    if (existingRestaurant) {
      // Retorna um erro se o email já estiver em uso por outro gerente
      return res.status(400).json({//ingles
        error: "This email is already in use by another manager."
      });
    }

    /// Criar o novo restaurante
    const newRestaurant = new mongoRestaurant({
      name: req.body.name,
      address: req.body.address,
      phone: req.body.phone,
      restaurantEmail: req.body.restaurantEmail,
      openingHours: typeof req.body.openingHours === 'string'
        ? JSON.parse(req.body.openingHours)
        : req.body.openingHours,
      paymentMethods: Array.isArray(req.body.paymentMethods)
        ? req.body.paymentMethods
        : req.body.paymentMethods ? [req.body.paymentMethods] : [],
      menus: Array.isArray(req.body.menus)
        ? req.body.menus
        : req.body.menus ? [req.body.menus] : [],
      managerId: managerId,
      isApproved: false,
      restaurantPic: restaurantPic,
    });


    await newRestaurant.save();

    // Buscar todos os administradores no banco de dados
    const admins = await mongoUser.find({ role: "Admin" }); // Substitua "mongoUser" pelo modelo de usuários
    const adminEmails = admins.map((admin) => admin.email); // Obter os e-mails dos administradores

    // Enviar e-mail para todos os administradores
    const mailOptions = {
      from: process.env.EMAIL_USER, // E-mail configurado no nodemailer
      to: adminEmails, // Lista de e-mails dos administradores
      subject: '📋 Novo Restaurante Pendente de Aprovação',
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; border-radius: 10px; overflow: hidden; box-shadow: 0 0 15px rgba(0, 0, 0, 0.08); background-color: #ffffff; border: 1px solid #e0e0e0;">

          <!-- Header -->
          <div style="background: #f39c12; padding: 30px 20px; text-align: center;">
            <img src="https://i.imgur.com/v1irJwp.jpeg" alt="App Logo" width="60" height="60" style=" margin-bottom: 20px; border-radius: 50%; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); display: block; margin-left: auto; margin-right: auto;" />
            <h1 style="color: #ffffff; font-size: 24px; margin: 0;">📋 Novo Restaurante Pendente</h1>
            <p style="color: #f9f9f9; font-size: 16px; margin-top: 8px;">Aprovação necessária para o novo restaurante</p>
          </div>

          <!-- Body -->
          <div style="padding: 25px 20px; color: #2c3e50; background-color: #f9f9f9;">
            <p style="font-size: 16px; margin-bottom: 15px;">
              Prezado(a) Administrador(a),
            </p>
            <p style="font-size: 14px; margin-bottom: 25px;">
              Um novo restaurante foi criado e está a aguardar a sua aprovação. Abaixo estão os detalhes do restaurante:
            </p>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; background-color: #ffffff; font-weight: bold;">Nome:</td>
                <td style="padding: 10px; border: 1px solid #ddd; background-color: #ffffff;">${newRestaurant.name}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; background-color: #ffffff; font-weight: bold;">Endereço:</td>
                <td style="padding: 10px; border: 1px solid #ddd; background-color: #ffffff;">${newRestaurant.address}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; background-color: #ffffff; font-weight: bold;">Telefone:</td>
                <td style="padding: 10px; border: 1px solid #ddd; background-color: #ffffff;">${newRestaurant.phone}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; background-color: #ffffff; font-weight: bold;">E-mail:</td>
                <td style="padding: 10px; border: 1px solid #ddd; background-color: #ffffff;">${newRestaurant.restaurantEmail}</td>
              </tr>
            </table>

            <p style="font-size: 14px; margin-bottom: 25px;">
              Por favor, acesse o painel de administração para aprovar ou rejeitar este restaurante.
            </p>

            <div style="text-align: center; margin-bottom: 30px;">
              <a href="http://localhost:4200/restaurants/pendingApproval" 
                style="background: linear-gradient(to right, #f39c12, #e67e22); color: white; padding: 14px 30px; text-decoration: none; font-size: 15px; border-radius: 6px; font-weight: bold;">
                📝 Aceder Painel de Administração
              </a>
            </div>

            <p style="font-size: 13px; color: #7f8c8d;">
              Se você tiver alguma dúvida ou precisar de ajuda, não hesite em nos contactar.
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #ecf0f1; color: #95a5a6; text-align: center; font-size: 12px; padding: 15px;">
            <p style="margin: 0;">Este é um e-mail automático do <strong>OrdEat</strong>. Por favor, não responda diretamente a este e-mail.</p>
          </div>

        </div>
      `
    };


    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Erro ao enviar e-mail aos administradores:', err);
      } else {
        console.log('E-mail enviado aos administradores:', info.response);
      }
    });

    logAction("Created Restaurant", req.user, {
      restaurantId: newRestaurant._id,
      name: newRestaurant.name,
    });

    res.status(201).json({ message: "Restaurante criado com sucesso!", restaurant: newRestaurant });
  } catch (err) {
    console.error("Error creating restaurant:", err);
    res.status(500).json({ error: "Erro ao criar restaurante." });
  }
};

// Controlador para deletar um restaurante
restaurantsController.deleteRestaurant = function (req, res, next) {
  const query = { _id: req.params.id };

  if (req.user && req.user.role === "Manager") {
    query.managerId = req.user._id; // Managers só podem eliminar os seus próprios restaurantes
  }

  mongoRestaurant
    .findOneAndDelete(query)
    .then(function (deletedRestaurant) {
      if (!deletedRestaurant) {
        return res.status(404).json({
          success: false,
          message: "You don't have permission to delete the restaurant or the restaurant was not found."
        });
      }

      if (req.user) {
        logAction("Deleted Restaurant", req.user, {
          restaurantId: deletedRestaurant._id,
          name: deletedRestaurant.name,
        });
      }

      // Resposta adequada para API
      res.json({ success: true, message: "Restaurant deleted successfully." });
    })
    .catch(function (err) {
      next(err);
    });
};

restaurantsController.renderEditRestaurant = async function (req, res, next) {
  try {
    // Buscar o restaurante pelo ID
    const restaurant = await mongoRestaurant.findById(req.params.id);

    if (!restaurant) {
      // Retorna 404 se o restaurante não for encontrado
      return res.status(404).json({ message: "Restaurant not found." });
    }

    const user = req.user;

    // Verificar permissões
    if (
      user.role !== "Admin" && // Apenas Admin pode acessar qualquer restaurante
      (!restaurant.managerId || restaurant.managerId.toString() !== user._id.toString()) // Gerente só pode acessar seus próprios restaurantes
    ) {
      // Retorna 403 se o usuário não tiver permissão
      return res.status(403).json({ message: "Access denied." });
    }

    // Buscar menus disponíveis para o gerente ou administrador
    const menus =
      user.role === "Manager"
        ? await mongoMenu.find({ managerId: user._id })
        : await mongoMenu.find();

    // jsonizar a página de edição do restaurante
    res.json({ restaurant, menus, user });
  } catch (err) {
    console.error("Error trying to edit restaurant:", err);
    next(err);
  }
};

restaurantsController.updateRestaurant = async function (req, res, next) {
  try {
    // Definir a query com base no papel do usuário
    const query =
      req.user.role === "Admin"
        ? { _id: req.params.id }
        : { _id: req.params.id, managerId: req.user._id }; // Apenas o gerente que criou o restaurante pode editá-lo

    // Verificar se já existe um restaurante com o mesmo email para outro gerente
    const existingRestaurant = await mongoRestaurant.findOne({
      restaurantEmail: req.body.restaurantEmail,
      _id: { $ne: req.params.id }, // Ignorar o restaurante que está sendo atualizado
      managerId: { $ne: req.user._id }, // Verifica se o email pertence a outro gerente
    });

    if (existingRestaurant) {
      // Retorna um erro se o email já estiver em uso por outro gerente
      return res.status(400).json({
        error: "This email is already in use by another manager.",
      });
    }

    // Dados atualizados
    const updatedData = {
      name: req.body.name,
      address: req.body.address,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      phone: req.body.phone,
      restaurantEmail: req.body.restaurantEmail,
      openingHours: typeof req.body.openingHours === 'string'
        ? JSON.parse(req.body.openingHours)
        : req.body.openingHours,
      paymentMethods: Array.isArray(req.body.paymentMethods)
        ? req.body.paymentMethods
        : req.body.paymentMethods ? [req.body.paymentMethods] : [],
      menus: Array.isArray(req.body.menus)
        ? req.body.menus
        : req.body.menus ? [req.body.menus] : [],

    };

    if (req.file) {
      updatedData.restaurantPic = req.file.filename; // Atualizar o campo com o novo nome do arquivo
    }

    // Atualizar o restaurante no banco de dados
    const updatedRestaurant = await mongoRestaurant.findOneAndUpdate(
      query,
      updatedData,
      { new: true, runValidators: true }
    );

    if (!updatedRestaurant) {
      return res
        .status(404)
        .json({ error: "Restaurant not found or you don't have permission to edit it." });
    }

    console.log("Restaurant updated:", updatedRestaurant);

    logAction("Updated Restaurant", req.user, {
      restaurantId: updatedRestaurant._id,
      name: updatedRestaurant.name,
    });

    res.json({ message: "Restaurant updated successfully.", restaurant: updatedRestaurant });
  } catch (err) {
    console.error("Error updating restaurant:", err);
    next(err);
  }
};

restaurantsController.getRestaurantById = async function (req, res) {
  try {
    const restaurant = await mongoRestaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found.' });
    }
    res.status(200).json(restaurant);
  } catch (err) {
    console.error("Error fetching restaurant:", err);
    res.status(500).json({ error: 'Internal server error while fetching restaurant.' });
  }
};


restaurantsController.showPendingRestaurants = async function (req, res, next) {
  if (req.user.role !== "Admin") return res.status(403).json({ error: "Access denied." });

  try {
    const { page = 1, limit = 10 } = req.query; // Página atual e limite de itens por página
    const skip = (page - 1) * limit;

    const user = req.user;

    // Buscar restaurantes pendentes de aprovação com paginação
    const restaurants = await mongoRestaurant
      .find({ isApproved: false })
      .skip(skip)
      .limit(parseInt(limit));

    // Total de restaurantes pendentes
    const totalRestaurants = await mongoRestaurant.countDocuments({ isApproved: false });
    const totalPages = Math.ceil(totalRestaurants / limit);

    // jsonizar a página com os restaurantes e informações de paginação
    res.json({
      restaurants,
      currentPage: parseInt(page),
      totalPages,
      user,
    });
  } catch (err) {
    console.error("Error fetching pending restaurants:", err);
    next(err);
  }
};

restaurantsController.approveRestaurant = function (req, res, next) {
  if (req.user.role !== "Admin") return res.status(403).send("Access denied.");

  mongoRestaurant
    .findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true })
    .then(() => {
      res.json({ message: "Restaurant approved successfully." });
    })
    .catch((err) => next(err));
};

restaurantsController.toggleVisibility = async function (req, res, next) {
  try {
    const { id } = req.params;
    const { isVisible } = req.body;

    const restaurant = await mongoRestaurant.findByIdAndUpdate(
      id,
      { isVisible },
      { new: true }
    );

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found.' });  
    }

    res.status(200).json({ message: 'Visibility updated successfully.' });
  } catch (err) {
    console.error('Error toggling visibility:', err);
    res.status(500).json({ error: 'An error occurred while updating visibility.' });
  }
};

module.exports = restaurantsController;
