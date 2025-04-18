const mongoUser = require("../models/user");

let usersController = {};

usersController.showUsers = async (req, res, next) => {

  const user = req.user;

  try {
    const users = await mongoUser.find({}, { password: 0 });
    res.render("users/showUsers", { users, user });
  } catch (err) {
    next(err);
  }
};

module.exports = usersController;
