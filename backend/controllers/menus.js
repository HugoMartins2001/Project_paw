const mongoMenu = require("../models/menu");
const mongoDish = require("../models/dish");
const mongoRestaurant = require("../models/restaurant");
const logAction = require("../utils/logger");
const mongoose = require('mongoose');

let menusController = {};

// jsoniza a página para criar um menu
menusController.renderCreateMenu = async function (req, res, next) {
  try {
    let dishes;

    if (req.user.role === "Manager") {
      dishes = await mongoDish.find({ managerId: req.user._id });
    } else {
      dishes = await mongoDish.find();
    }

    res.json({
      dishes,
      user: req.user, // Passa o usuário autenticado para o EJS
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// Controlador para exibir todos os menus
menusController.showAll = async function (req, res, next) {
  try {
    const user = req.user; 
    const { page = 1, limit = 6, name, restaurant, minPrice, maxPrice, sortBy = "name", order = "asc" } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (name) {
      query.name = { $regex: name, $options: "i" };
    }

    if (!user) {
      query.isVisible = true;
    } else if (user.role === "Manager") {
      query.managerId = user._id;
    } else if (user.role === "Client") {
      query.isVisible = true;
    }

    if (minPrice) {
      query.price = { ...query.price, $gte: Number(minPrice) };
    }
    if (maxPrice) {
      query.price = { ...query.price, $lte: Number(maxPrice) };
    }

    const sortOrder = order === "desc" ? -1 : 1;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;

    const menuList = await mongoMenu
      .find(query)
      .populate("dishes")
      .populate("restaurant")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const allRestaurants = await mongoRestaurant.find();

    const menusWithRestaurants = menuList.map((menu) => {
      const associatedRestaurants = allRestaurants
        .filter((restaurant) => {
          if (user && user.role === "Admin") {
            return restaurant.menus.includes(menu._id);
          }
          if (user && user.role === "Manager") {
            return (
              restaurant.menus.includes(menu._id) &&
              restaurant.managerId.toString() === user._id.toString()
            );
          }
          return restaurant.menus.includes(menu._id);
        })
        .map((restaurant) => restaurant.name);

      return {
        ...menu.toObject(),
        restaurantNames: associatedRestaurants,
      };
    });

    const filteredMenus = menusWithRestaurants.filter((menu) => {
      if (!menu.managerId) return false;
      if (!user) return menu.isVisible === true;
      if (user.role === "Admin") return true;
      if (user.role === "Client" && menu.isVisible) return true;
      if (user.role === "Manager" && menu.managerId.toString() === user._id.toString()) return true;
      return false;
    });

    const totalMenus = await mongoMenu.countDocuments(query);
    const totalPages = Math.ceil(totalMenus / limit);

    res.json({
      menus: filteredMenus,
      user: user || null,
      currentPage: parseInt(page),
      totalPages,
      filters: { name, sortBy, order },
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// Controlador para criar um menu
menusController.createMenu = async function (req, res, next) {
  try {
    const { name, dishes, restaurant } = req.body;
    const menuPic = req.file ? req.file.filename : null; 

    const dishesArray = Array.isArray(dishes) ? dishes : [dishes];

    const newMenu = new mongoMenu({
      name,
      dishes: dishesArray,
      restaurant,
      managerId: req.user._id,
      menuPic,
    });

    await newMenu.save();

    logAction("Created Menu", req.user, { menuId: newMenu._id, name });

    res.json({ message: "Menu created successfully", menuId: newMenu._id });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// Controlador para exibir os detalhes de um menu
menusController.showMenu = async function (req, res, next) {
  const menuId = req.params.menuId;

  try {
    const menu = await mongoMenu.findById(menuId).populate("dishes");

    if (!menu) {
      return res.status(404).json({ message: "Menu not found." });
    }

    // Permissões:
    // - Admin pode ver tudo
    // - Manager só vê os seus
    // - Client só vê menus visíveis
    if (
      req.user.role === "Manager" &&
      (!menu.managerId || menu.managerId.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({ message: "Access denied." });
    }
    if (
      req.user.role === "Client" &&
      menu.isVisible !== true
    ) {
      return res.status(403).json({ message: "Access denied." });
    }

    const query =
      req.user.role === "Manager"
        ? { menus: menuId, managerId: req.user._id } 
        : { menus: menuId };

    const allRestaurants = await mongoRestaurant.find(query).select("name");

    const restaurantList = allRestaurants.map((restaurant) => ({
      id: restaurant._id,
      name: restaurant.name,
    }));

    res.json({
      menu: menu.toObject(),
      restaurants: restaurantList,
      user: req.user,
    });
  } catch (err) {
    console.error("Error fetching menu details:", err);
    next(err);
  }
};

// Controlador para apagar um menu
menusController.deleteMenu = function (req, res, next) {
  const user = req.user;

  mongoMenu
    .findById(req.params.menuId)
    .then(function (menu) {
      if (!menu) {
        return res.status(404).send("Menu not found.");
      }

      if (
        user.role !== "Admin" &&
        menu.managerId.toString() !== user._id.toString()
      ) {
        return res
          .status(403)
          .send("You dont have permission to delete this menu.");
      }

      return mongoMenu.findByIdAndDelete(req.params.menuId).then(() => {
        logAction("Deleted Menu", user, { menuId: menu._id, name: menu.name });
      });
    })
    .then(function () {
      res.json({ message: "Menu deleted successfully." });
    })
    .catch(function (err) {
      next(err);
    });
};

menusController.renderEditMenu = async function (req, res, next) {
  try {
    const menu = await mongoMenu
      .findById(req.params.menuId)
      .populate("dishes")
      .populate("restaurant");

    if (!menu) {
      return res.status(404).json("errors/404", { message: "Menu not found." });
    }

    const user = req.user;

    if (
      req.user.role !== "Admin" && 
      menu.managerId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json("errors/403", { message: "You do not have permission to edit this menu." });
    }

    let allDishes;
    if (req.user.role === "Manager") {
      allDishes = await mongoDish.find({ managerId: req.user._id });
    } else {
      allDishes = await mongoDish.find();
    }

    const restaurants = await mongoRestaurant.find();

    res.json({ menu, dishes: allDishes, restaurants, user });
  } catch (err) {
    next(err);
  }
};

menusController.updateMenu = async function (req, res, next) {
  try {
    const menuId = req.params.menuId;

    const menu = await mongoMenu.findById(menuId);

    if (!menu) {
      return res.status(404).json({ message: "Menu not found." });
    }

    if (
      req.user.role !== "Admin" &&
      menu.managerId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied." });
    }

    const dishesArray = Array.isArray(req.body.dishes)
      ? req.body.dishes
      : [req.body.dishes];
    const updatedData = {
      name: req.body.name,
      dishes: dishesArray,
      restaurant: req.body.restaurant,
    };

    if (req.file) {
      updatedData.menuPic = req.file.filename;
    }

    const updatedMenu = await mongoMenu.findByIdAndUpdate(menuId, updatedData, {
      new: true,
      runValidators: true,
    });

    logAction("Updated Menu", req.user, { menuId: updatedMenu._id, name: updatedMenu.name });

    res.json({ message: "Menu updated successfully", menuId: updatedMenu._id });
  } catch (err) {
    next(err);
  }
};

menusController.toggleVisibility = async function (req, res, next) {
  try {
    const { id } = req.params;
    const { isVisible } = req.body;

    const menu = await mongoMenu.findByIdAndUpdate(
      id,
      { isVisible },
      { new: true }
    );

    if (!menu) {
      return res.status(404).json({ message: 'Menu not found.' });
    }

    res.status(200).json({ message: 'Visibility updated successfully.', menu });
  } catch (err) {
    console.error('Error toggling visibility:', err);
    res.status(500).json({ message: 'An error occurred while updating visibility.' });
  }
};

module.exports = menusController;
