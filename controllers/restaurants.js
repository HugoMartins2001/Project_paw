const mongoRestaurant = require("../models/restaurant");
const mongoMenu = require("../models/menu");
const logAction = require("../utils/logger");

let restaurantsController = {};

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
    if (req.user.role === "Manager") {
      query.managerId = req.user._id; // Gerentes só podem ver seus próprios restaurantes
    } else if (req.user.role === "Client") {
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

    // Renderizar a página com os restaurantes filtrados e informações de paginação
    res.render("restaurants/showRestaurants", {
      restaurants: filteredRestaurants,
      restaurants: restaurantList,
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
      ? { name: req.params.name, managerId: req.user._id } // Gerente só pode acessar seus próprios restaurantes
      : { name: req.params.name }; // Admin pode acessar qualquer restaurante

  mongoRestaurant
    .findOne(query)
    .populate("menus") // Popula os menus associados ao restaurante
    .then(function (restaurantDB) {
      if (!restaurantDB) {
        // Retorna 404 se o restaurante não for encontrado
        return res.status(404).render("errors/404", { message: "Restaurant not found." });
      }

      // Verificar permissões
      if (
        req.user.role !== "Admin" && // Apenas Admin pode acessar qualquer restaurante
        (!restaurantDB.managerId || restaurantDB.managerId.toString() !== req.user._id.toString()) // Gerente só pode acessar seus próprios restaurantes
      ) {
        // Retorna 403 se o usuário não tiver permissão
        return res.status(403).render("errors/403", { message: "Access denied." });
      }

      // Filtrar menus para que apenas os que são criados pelo gerente autenticado sejam exibidos
      const filteredMenus = restaurantDB.menus.filter((menu) => {
        // Administradores podem ver todos os menus
        if (req.user.role === "Admin") {
          return true;
        }

        // Gerentes só podem ver menus que eles criaram
        return menu.managerId.toString() === req.user._id.toString();
      });

      const inputs = {
        restaurant: {
          ...restaurantDB.toObject(),
          menus: filteredMenus,
        },
        user: req.user,
      };

      res.render("restaurants/showRestaurant", inputs);
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

    res.render("restaurants/submitRestaurant", {
      menus,
      user: req.user, // Passa o usuário logado para o EJS
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// Controlador para criar um restaurante
restaurantsController.createRestaurant = function (req, res, next) {
  const managerId = req.user._id;

  const restaurantPic = req.file ? req.file.filename : null;

  const newRestaurant = new mongoRestaurant({
    name: req.body.name,
    address: req.body.address,
    phone: req.body.phone,
    email: req.body.email,
    openingHours: req.body.openingHours,
    paymentMethods: req.body.paymentMethods,
    menus: req.body.menus || [],
    managerId: managerId,
    isApproved: false, // Restaurantes criados inicialmente não são aprovados
    restaurantPic: restaurantPic, 
  });

  newRestaurant
    .save()
    .then(function (restaurant) {
      logAction("Created Restaurant", req.user, {
        restaurantId: restaurant._id,
        name: restaurant.name,
      });

      res.redirect("/restaurants/showRestaurants");
    })
    .catch(function (err) {
      next(err);
    });
};

// Controlador para deletar um restaurante
restaurantsController.deleteRestaurant = function (req, res, next) {
  const query = { _id: req.params.id }; 

  if (req.user.role === "Manager") {
    query.managerId = req.user._id; // Gerentes só podem deletar seus próprios restaurantes
  }

  mongoRestaurant
    .findOneAndDelete(query)
    .then(function (deletedRestaurant) {
      if (!deletedRestaurant) {
        return res
          .status(404)
          .send(
            "You don´t have permission to delete the restaurant or the restaurant was not found."
          );
      }

      logAction("Deleted Restaurant", req.user, {
        restaurantId: deletedRestaurant._id,
        name: deletedRestaurant.name,
      });

      res.redirect("/restaurants/showRestaurants");
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
      return res.status(404).render("errors/404", { message: "Restaurant not found." });
    }

    const user = req.user;

    // Verificar permissões
    if (
      user.role !== "Admin" && // Apenas Admin pode acessar qualquer restaurante
      (!restaurant.managerId || restaurant.managerId.toString() !== user._id.toString()) // Gerente só pode acessar seus próprios restaurantes
    ) {
      // Retorna 403 se o usuário não tiver permissão
      return res.status(403).render("errors/403", { message: "Access denied." });
    }

    // Buscar menus disponíveis para o gerente ou administrador
    const menus =
      user.role === "Manager"
        ? await mongoMenu.find({ managerId: user._id })
        : await mongoMenu.find();

    // Renderizar a página de edição do restaurante
    res.render("restaurants/editRestaurant", { restaurant, menus, user });
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

    // Dados atualizados
    const updatedData = {
      name: req.body.name,
      address: req.body.address,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      phone: req.body.phone,
      email: req.body.email,
      openingHours: req.body.openingHours,
      paymentMethods: req.body.paymentMethods,
      menus: req.body.menus || [],
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
        .send("Restaurant not found or you don't have permission to edit it.");
    }

    logAction("Updated Restaurant", req.user, {
      restaurantId: updatedRestaurant._id,
      name: updatedRestaurant.name,
    });

    res.redirect("/restaurants/showRestaurants");
  } catch (err) {
    console.error("Error updating restaurant:", err);
    next(err);
  }
};

restaurantsController.showPendingRestaurants = async function (req, res, next) {
  if (req.user.role !== "Admin") return res.status(403).send("Access denied.");

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

    // Renderizar a página com os restaurantes e informações de paginação
    res.render("restaurants/pendingApproval", {
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
      res.redirect("/restaurants/pendingApproval");
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
      return res.status(404).send('Restaurant not found.');
    }

    res.status(200).send('Visibility updated successfully.');
  } catch (err) {
    console.error('Error toggling visibility:', err);
    res.status(500).send('An error occurred while updating visibility.');
  }
};

module.exports = restaurantsController;
