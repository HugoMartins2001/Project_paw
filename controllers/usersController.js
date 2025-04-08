const mongoUser = require("../models/user");

let usersController = {};

usersController.showUsers = async (req, res, next) => {
  try {
    const users = await mongoUser.find({}, { password: 0 });
    res.render("users/showUsers", { users });
  } catch (err) {
    next(err);
  }
};

module.exports = usersController;
