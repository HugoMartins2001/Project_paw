const mongoUser = require("../models/user");

let usersController = {};

// Controlador para exibir todos os usuários
usersController.showUsers = async (req, res, next) => {
  const user = req.user; // Obtém o usuário autenticado

  try {
    // Busca todos os usuários no banco de dados, excluindo o campo "password" por segurança
    const users = await mongoUser.find({}, { password: 0 });

    // Renderiza a página de exibição de usuários, passando os dados dos usuários e o usuário autenticado
    res.render("users/showUsers", { users, user });
  } catch (err) {
    next(err); // Passa o erro para o middleware de tratamento de erros
  }
};

module.exports = usersController;
