const mongoMenu = require('../models/menu');
const mongoDish = require('../models/dish');
const mongoRestaurant = require('../models/restaurant'); 

let menusController = {};


menusController.renderCreateMenu = async function (req, res, next) {
    try {
        const dishes = await mongoDish.find();
        res.render('menus/submitMenu', { dishes });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

menusController.showAll = function (req, res, next) {
    const user = req.user;

    mongoMenu.find()
        .populate('dishes')
        .then(function (menuList) {

            const filteredMenus = menuList.filter(menu => {
                if (!menu.managerId) { 

                    return false; 
                }


                if (user.role === 'admin') {
                    return true;
                }

  
                if (user.role === 'manager' && menu.managerId.toString() === user._id.toString()) {
                    return true;
                }

                return false;
            });

            res.render('menus/showMenus', {
                menus: filteredMenus,
                user: user
            });
        })
        .catch(function (err) {
            next(err);
        });
};




menusController.renderCreateMenu = async function (req, res, next) {
    try {
        let dishes;


        if (req.user.role === 'manager') {
            dishes = await mongoDish.find({ managerId: req.user._id });
        } else {

            dishes = await mongoDish.find();
        }

        res.render('menus/submitMenu', { dishes });
    } catch (error) {
        console.error(error);
        next(error);
    }
};


menusController.createMenu = async function (req, res, next) {
    try {
        const { name, dishes, restaurant } = req.body;


        const dishesArray = Array.isArray(dishes) ? dishes : [dishes];


        const newMenu = new mongoMenu({
            name,
            dishes: dishesArray,
            restaurant,
            managerId: req.user._id  
        });


        await newMenu.save();


        res.redirect('/menus/showMenus');
    } catch (error) {
        console.error(error);
        next(error);
    }
};



menusController.showMenu = function (req, res, next) {
    const menuId = req.params.menuId;

    mongoMenu.findById(menuId)
        .populate('dishes')
        .then(function (menu) {
            if (!menu) {
                return res.status(404).send('Menu não encontrado.');
            }
            res.render('menus/showMenu', { menu });
        })
        .catch(function (err) {
            next(err);
        });
};


menusController.deleteMenu = function (req, res, next) {
    const user = req.user;

    mongoMenu.findById(req.params.menuId)
        .then(function (menu) {
            if (!menu) {
                return res.status(404).send('Menu não encontrado.');
            }


            if (user.role !== 'admin' && menu.managerId.toString() !== user._id.toString()) {
                return res.status(403).send('Você não tem permissão para excluir este menu.');
            }

            return mongoMenu.findByIdAndDelete(req.params.menuId);
        })
        .then(function () {
            res.redirect('/menus/showMenus');
        })
        .catch(function (err) {
            next(err);
        });
};


menusController.renderEditMenu = async function(req, res, next) {
    try {
        const menu = await mongoMenu.findById(req.params.menuId).populate('dishes').populate('restaurant');
        let allDishes;


        if (req.user.role === 'manager') {
            allDishes = await mongoDish.find({ managerId: req.user._id });
        } else {

            allDishes = await mongoDish.find();
        }

        const restaurants = await mongoRestaurant.find();  

        if (!menu) {
            return res.status(404).send('Menu não encontrado.');
        }

        res.render('menus/editMenu', { menu, dishes: allDishes, restaurants });
    } catch (err) {
        next(err);
    }
};


menusController.updateMenu = function(req, res, next) {
    const menuId = req.params.menuId;
    const updatedData = {
        name: req.body.name,
        dishes: Array.isArray(req.body.dishes) ? req.body.dishes : [req.body.dishes],
        restaurant: req.body.restaurant  
    };

    mongoMenu.findByIdAndUpdate(menuId, updatedData, { new: true, runValidators: true })
        .then(function(updated) {
            if (!updated) {
                return res.status(404).send('Menu não encontrado.');
            }
            res.redirect('/menus/showMenus');
        })
        .catch(function(err) {
            next(err);
        });
};



module.exports = menusController;
