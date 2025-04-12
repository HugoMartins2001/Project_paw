const mongoUser = require("../models/user");

const profile = {};

profile.editProfile = function (req, res, next) {
  if (!req.user) return res.redirect("/auth/login");
  res.render("dashboard/editProfile", { user: req.user });
};

profile.updateProfile = function (req, res, next) {
  const userId = req.user._id;
  const {
    name,
    email,
    clienteTelemovel,
    clienteNif,
    address,
    managerTelemovel,
  } = req.body;

  const updatedUserData = {
    name,
    email,
    clienteTelemovel,
    clienteNif,
    address,
    managerTelemovel,
  };

  mongoUser
    .findByIdAndUpdate(userId, updatedUserData, { new: true })
    .then(() => res.redirect("/profile/editProfile"))
    .catch((err) => next(err));
};

module.exports = profile;
