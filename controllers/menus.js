const mongoMenu = require("../models/menu");
const mongoDish = require("../models/dish");
const mongoRestaurant = require("../models/restaurant");
const logAction = require("../utils/logger");


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
    const { page = 1, limit = 6, name, restaurant, minPrice, maxPrice, sortBy = "name", order = "asc" } = req.query; // Parâmetros de filtro e ordenação
    const skip = (page - 1) * limit;

    // Construir o filtro de busca
    let query = {};

    // Filtrar por nome do menu
    if (name) {
      query.name = { $regex: name, $options: "i" }; // Busca por nome (case insensitive)
    }

    // Filtrar menus com base no papel do usuário
    if (user.role === "Manager") {
      query.managerId = user._id; // Gerentes só podem ver menus que eles criaram
    }else if (req.user.role === 'Client') {
      query.isVisible = true; // Clientes só podem ver menus visíveis
    }

    // Ordenação
    const sortOrder = order === "desc" ? -1 : 1; // Ordem ascendente ou descendente
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;

    // Buscar menus com base no filtro e aplicar paginação e ordenação
    const menuList = await mongoMenu
      .find(query)
      .populate("dishes")
      .populate("restaurant")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

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

      if (user.role === "Client" && menu.isVisible) {
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

    // Total de menus para paginação
    const totalMenus = await mongoMenu.countDocuments(query);
    const totalPages = Math.ceil(totalMenus / limit);


    // Renderizar a página com os menus filtrados e informações de paginação
    res.render("menus/showMenus", {
      menus: filteredMenus,
      user: user,
      currentPage: parseInt(page),
      totalPages,
      filters: { name, sortBy, order },
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

    res.render("menus/submitMenu", {
      dishes,
      user: req.user, // Passa o usuário logado para o EJS
    });
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

    logAction("Created Menu", req.user, { menuId: newMenu._id, name });

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
      return res.status(404).render("errors/404", { message: "Menu not found." });
    }

    // Verificar permissões
    if (
      req.user.role !== "Admin" && // Apenas Admin pode acessar qualquer menu
      (!menu.managerId || menu.managerId.toString() !== req.user._id.toString()) // Gerente só pode acessar seus próprios menus
    ) {
      return res.status(403).render("errors/403", { message: "Access denied." });
    }

    // Buscar todos os restaurantes que contêm este menu
    const query =
      req.user.role === "Manager"
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

      return mongoMenu.findByIdAndDelete(req.params.menuId).then(() => {
        logAction("Deleted Menu", user, { menuId: menu._id, name: menu.name });
      });
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

    if (!menu) {
      return res.status(404).render("errors/404", { message: "Menu not found." });
    }

    const user = req.user;

    // Verificar permissões
    if (
      req.user.role !== "Admin" && // Admin pode acessar qualquer menu
      menu.managerId.toString() !== req.user._id.toString() // Apenas o gerente que criou o menu pode acessá-lo
    ) {
      return res.status(403).render("errors/403", { message: "You do not have permission to edit this menu." });
      }

    let allDishes;
    if (req.user.role === "Manager") {
      allDishes = await mongoDish.find({ managerId: req.user._id });
    } else {
      allDishes = await mongoDish.find();
    }

    const restaurants = await mongoRestaurant.find();

    res.render("menus/editMenu", { menu, dishes: allDishes, restaurants, user });
  } catch (err) {
    next(err);
  }
};

menusController.updateMenu = async function (req, res, next) {
  try {
    const menuId = req.params.menuId;

    // Buscar o menu pelo ID
    const menu = await mongoMenu.findById(menuId);

    if (!menu) {
      return res.status(404).send("Menu not found.");
    }

    // Verificar permissões
    if (
      req.user.role !== "Admin" && // Admin pode editar qualquer menu
      menu.managerId.toString() !== req.user._id.toString() // Apenas o gerente que criou o menu pode editá-lo
    ) {
      return res.status(403).send("Access denied.");
    }

    // Atualizar os dados do menu
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

    res.redirect("/menus/showMenus");
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
      return res.status(404).send('Menu not found.');
    }

    res.status(200).send('Visibility updated successfully.');
  } catch (err) {
    console.error('Error toggling visibility:', err);
    res.status(500).send('An error occurred while updating visibility.');
  }
};

module.exports = menusController;
