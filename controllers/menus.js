const mongoMenu = require("../models/menu");
const mongoDish = require("../models/dish");
const mongoRestaurant = require("../models/restaurant");

let menusController = {};

menusController.renderCreateMenu = async function (req, res, next) {
  try {
    const dishes = await mongoDish.find();
    res.render("menus/submitMenu", { dishes });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

menusController.showAll = async function (req, res, next) {
  try {
    const user = req.user;

    // Buscar todos os menus
    const menuList = await mongoMenu.find().populate("dishes");

    // Buscar todos os restaurantes
    const allRestaurants = await mongoRestaurant.find();

    // Associar manualmente os restaurantes aos menus
    const menusWithRestaurants = menuList.map((menu) => {
      const associatedRestaurants = allRestaurants
        .filter((restaurant) => {
          // Administradores podem ver todos os restaurantes
          if (user.role === "Admin") {
            return restaurant.menus.includes(menu._id);
          }
          // Gerentes só podem ver restaurantes que eles criaram
          return (
            restaurant.menus.includes(menu._id) &&
            restaurant.managerId.toString() === user._id.toString()
          );
        })
        .map((restaurant) => restaurant.name);

      return {
        ...menu.toObject(),
        restaurantNames: associatedRestaurants,
      };
    });

    // Filtrar menus com base no papel do usuário
    const filteredMenus = menusWithRestaurants.filter((menu) => {
      if (!menu.managerId) {
        return false;
      }

      if (user.role === "Admin") {
        return true;
      }

      if (
        user.role === "Manager" &&
        menu.managerId.toString() === user._id.toString()
      ) {
        return true;
      }

      return false;
    });

    // Renderizar a página com os menus filtrados
    res.render("menus/showMenus", {
      menus: filteredMenus,
      user: user,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

menusController.renderCreateMenu = async function (req, res, next) {
  try {
    let dishes;

    if (req.user.role === "Manager") {
      dishes = await mongoDish.find({ managerId: req.user._id });
    } else {
      dishes = await mongoDish.find();
    }

    res.render("menus/submitMenu", { dishes });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

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

    res.redirect("/menus/showMenus");
  } catch (error) {
    console.error(error);
    next(error);
  }
};

menusController.showMenu = async function (req, res, next) {
  const menuId = req.params.menuId;

  try {
    // Buscar o menu pelo ID e popular os pratos associados
    const menu = await mongoMenu.findById(menuId).populate("dishes");

    if (!menu) {
      return res.status(404).send("Menu not found.");
    }

    // Buscar todos os restaurantes que contêm este menu
    const query = req.user.role === "Manager"
      ? { menus: menuId, managerId: req.user._id } // Gerentes só veem seus próprios restaurantes
      : { menus: menuId }; // Administradores veem todos os restaurantes

    const allRestaurants = await mongoRestaurant.find(query).select("name");

    // Criar uma lista de restaurantes com nome e ID
    const restaurantList = allRestaurants.map((restaurant) => ({
      id: restaurant._id,
      name: restaurant.name,
    }));

    // Renderizar a página com os dados do menu e dos restaurantes
    res.render("menus/showMenu", {
      menu: menu.toObject(),
      restaurantList,
      user: req.user, // Passa o usuário logado para o header
    });
  } catch (err) {
    console.error("Error fetching menu details:", err);
    next(err);
  }
};

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

      return mongoMenu.findByIdAndDelete(req.params.menuId);
    })
    .then(function () {
      res.redirect("/menus/showMenus");
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
    let allDishes;

    if (req.user.role === "Manager") {
      allDishes = await mongoDish.find({ managerId: req.user._id });
    } else {
      allDishes = await mongoDish.find();
    }

    const restaurants = await mongoRestaurant.find();

    if (!menu) {
      return res.status(404).send("Menu not found.");
    }

    res.render("menus/editMenu", { menu, dishes: allDishes, restaurants });
  } catch (err) {
    next(err);
  }
};

menusController.updateMenu = function (req, res, next) {
  const menuId = req.params.menuId;
  const updatedData = {
    name: req.body.name,
    dishes: Array.isArray(req.body.dishes)
      ? req.body.dishes
      : [req.body.dishes],
    restaurant: req.body.restaurant,
  };

  if (req.file) {
    updatedData.menuPic = req.file.filename;
  }  

  mongoMenu
    .findByIdAndUpdate(menuId, updatedData, { new: true, runValidators: true })
    .then(function (updated) {
      if (!updated) {
        return res.status(404).send("Menu not found.");
      }
      res.redirect("/menus/showMenus");
    })
    .catch(function (err) {
      next(err);
    });
};

module.exports = menusController;
