const mongoRestaurant = require("../models/restaurant");
const mongoMenu = require("../models/menu");

let restaurantsController = {};

restaurantsController.showAll = async function (req, res, next) {
  if (!req.user) return res.redirect("/auth/login");

  try {
    let query = {};

    // Filtrar restaurantes com base no papel do usuário
    if (req.user.role === "Manager") {
      query = { managerId: req.user._id }; // Gerentes só podem ver seus próprios restaurantes
    } else if (req.user.role === "client") {
      query = { isApproved: true }; // Clientes só podem ver restaurantes aprovados
    }

    // Buscar restaurantes com base no filtro
    const restaurants = await mongoRestaurant.find(query).populate("menus");

    // Filtrar menus para que apenas os criados pelo gerente logado sejam exibidos
    const filteredRestaurants = restaurants.map((restaurant) => {
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

    // Renderizar a página com os restaurantes filtrados
    res.render("restaurants/showRestaurants", {
      restaurants: filteredRestaurants,
      user: req.user,
    });
    res.status(200).json(restaurants);
  } catch (err) {
    console.error("Error fetching restaurants:", err);
    next(err);
  }
};

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
        return res.render("restaurants/showRestaurant", { restaurant: null, user: req.user });
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

    res.render("restaurants/submitRestaurant", { menus });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

restaurantsController.createRestaurant = function (req, res, next) {
  const managerId = req.user._id;

  const newRestaurant = new mongoRestaurant({
    name: req.body.name,
    address: req.body.address,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    phone: req.body.phone,
    email: req.body.email,
    openingHours: req.body.openingHours,
    paymentMethods: req.body.paymentMethods,
    menus: req.body.menus || [],
    managerId: managerId,
    isApproved: false,
  });

  newRestaurant
    .save()
    .then(function (restaurant) {
      res.redirect("/restaurants/showRestaurants");
    })
    .catch(function (err) {
      next(err);
    });
};

restaurantsController.deleteRestaurant = function (req, res, next) {
  const query = { _id: req.params.id }; 

  if (req.user.role === "Manager") {
    query.managerId = req.user._id; 
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
      res.redirect("/restaurants/showRestaurants");
    })
    .catch(function (err) {
      next(err);
    });
};

restaurantsController.renderEditRestaurant = async function (req, res, next) {
  try {
    const menus =
      req.user.role === "Manager"
        ? await mongoMenu.find({ managerId: req.user._id })
        : await mongoMenu.find();

    const restaurant =
      req.user.role === "Admin"
        ? await mongoRestaurant.findById(req.params.id) 
        : await mongoRestaurant.findOne({
            _id: req.params.id, 
            managerId: req.user._id,
          });

    if (!restaurant) {
      return res
        .status(404)
        .send("Restaurant not found or without permission.");
    }

    res.render("restaurants/editRestaurant", { restaurant, menus });
  } catch (err) {
    console.error("Error trying to edit restaurant:", err);
    next(err);
  }
};

restaurantsController.updateRestaurant = function (req, res, next) {
  const query =
    req.user.role === "Admin"
      ? { _id: req.params.id } 
      : { _id: req.params.id, managerId: req.user._id }; 

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

  mongoRestaurant
    .findOneAndUpdate(query, updatedData, { new: true, runValidators: true })
    .then(function (updated) {
      if (!updated) {
        return res
          .status(404)
          .send("Restaurant not found or without permission.");
      }
      res.redirect("/restaurants/showRestaurants");
    })
    .catch(function (err) {
      console.error(err);
      next(err);
    });
};

restaurantsController.showPendingRestaurants = function (req, res, next) {
  if (req.user.role !== "Admin") return res.status(403).send("Access denied.");

  mongoRestaurant
    .find({ isApproved: false })
    .then((restaurants) => {
      res.render("restaurants/pendingApproval", { restaurants });
    })
    .catch((err) => next(err));
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

module.exports = restaurantsController;
