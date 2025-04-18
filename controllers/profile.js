const mongoUser = require("../models/user");

const profile = {};

// Renderizar a página de edição de perfil
profile.editProfile = function (req, res, next) {
  if (!req.user) return res.redirect("/auth/login");

  res.render("dashboard/editProfile", { user: req.user });
};

// Atualizar o perfil do usuário
profile.updateProfile = function (req, res, next) {
  try {
    const userId = req.user._id;

    // Dados enviados pelo formulário
    const {
      name,
      email,
      clienteTelemovel,
      clienteNif,
      address,
      managerTelemovel,
    } = req.body;

    // Dados atualizados
    const updatedUserData = {
      name,
      email,
      clienteTelemovel,
      clienteNif,
      address,
      managerTelemovel,
    };

    // Verificar se há uma nova imagem de perfil
    if (req.file) {
      updatedUserData.profilePic = req.file.filename;
    }

    // Atualizar o usuário no banco de dados
    mongoUser
      .findByIdAndUpdate(userId, updatedUserData, { new: true, runValidators: true })
      .then((updatedUser) => {
        if (!updatedUser) {
          return res.status(404).send("User not found.");
        }
        res.redirect("/profile");
      })
      .catch((err) => {
        console.error("Error updating profile:", err);
        next(err);
      });
  } catch (err) {
    console.error("Unexpected error:", err);
    next(err);
  }
};

module.exports = profile;
