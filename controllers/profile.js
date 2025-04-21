const mongoUser = require("../models/user");

const profile = {};

// Renderizar a página de edição de perfil
profile.editProfile = function (req, res, next) {
  if (!req.user) return res.redirect("/auth/login"); // Redireciona para a página de login se o usuário não estiver autenticado

  res.render("dashboard/editProfile", { user: req.user }); // Renderiza a página de edição de perfil com os dados do usuário
};

// Atualizar o perfil do usuário
profile.updateProfile = function (req, res, next) {
  try {
    const userId = req.user._id; // Obtém o ID do usuário autenticado

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
      updatedUserData.profilePic = req.file.filename; // Adiciona o caminho da nova imagem de perfil
    }

    // Atualizar o usuário no banco de dados
    mongoUser
      .findByIdAndUpdate(userId, updatedUserData, { new: true, runValidators: true }) // Atualiza o usuário e retorna o documento atualizado
      .then((updatedUser) => {
        if (!updatedUser) {
          return res.status(404).send("User not found."); // Retorna erro 404 se o usuário não for encontrado
        }
        res.redirect("/profile"); // Redireciona para a página de perfil após a atualização
      })
      .catch((err) => {
        console.error("Error updating profile:", err); // Loga o erro no console
        next(err); // Passa o erro para o middleware de tratamento de erros
      });
  } catch (err) {
    console.error("Unexpected error:", err); // Loga erros inesperados
    next(err); // Passa o erro para o middleware de tratamento de erros
  }
};

module.exports = profile;
