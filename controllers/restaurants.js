const mongoose = require("mongoose");
const mongoRestaurant = require("../models/restaurant");
const mongoMenu = require("../models/menu");

let restaurantsController = {};

restaurantsController.showAll = function (req, res, next) {
  if (!req.user) return res.redirect("/auth/login");

  let query = {};

  if (req.user.role === "manager") {
    query = { managerId: req.user._id };
  } else if (req.user.role === "client") {
    query = { isApproved: true };
  }

  mongoRestaurant
    .find(query)
    .then((restaurantList) => {
      res.render("restaurants/showRestaurants", {
        restaurants: restaurantList,
        user: req.user,
      });
    })
    .catch((err) => next(err));
};

restaurantsController.showDetails = function (req, res, next) {
  const query =
    req.user.role === "manager"
      ? { name: req.params.name, managerId: req.user._id }
      : { name: req.params.name };

  mongoRestaurant
    .findOne(query)
    .populate("menus")
    .then(function (restaurantDB) {
      if (!restaurantDB) {
        return res.render("restaurants/showRestaurant", { restaurant: null });
      }

      const inputs = {
        restaurant: restaurantDB,
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

    if (req.user.role === "manager") {
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
  const query = { name: req.params.name };

  if (req.user.role === "manager") {
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
      req.user.role === "manager"
        ? await mongoMenu.find({ managerId: req.user._id })
        : await mongoMenu.find();

    const restaurant =
      req.user.role === "admin"
        ? await mongoRestaurant.findOne({ name: req.params.name })
        : await mongoRestaurant.findOne({
          name: req.params.name.trim(),
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
  const managerId = req.user._id;
  const query = { name: req.params.name, managerId };

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

  console.log("Updating restaurant with the following data:", updatedData);

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
  if (req.user.role !== "admin") return res.status(403).send("Access denied.");

  mongoRestaurant
    .find({ isApproved: false })
    .then((restaurants) => {
      res.render("restaurants/pendingApproval", { restaurants });
    })
    .catch((err) => next(err));
};

restaurantsController.approveRestaurant = function (req, res, next) {
  if (req.user.role !== "admin") return res.status(403).send("Access denied.");

  mongoRestaurant
    .findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true })
    .then(() => {
      res.redirect("/restaurants/pendingApproval");
    })
    .catch((err) => next(err));
};

module.exports = restaurantsController;
