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

// Controlador para bloquear/desbloquear usuários
usersController.blockUser = async (req, res, next) => {
  try {
    const userId = req.params.id; // Obtém o ID do usuário a ser bloqueado/desbloqueado
    const user = await mongoUser.findById(userId);

    if (!user) {
      return res.status(404).send("User not found"); // Retorna erro 404 se o usuário não for encontrado
    }

    // Alterna o status de bloqueio do usuário
    user.isBlocked = !user.isBlocked;
    await user.save(); // Salva a alteração no banco de dados

    res.redirect("/users/showUsers"); // Redireciona para a lista de usuários
  } catch (err) {
    next(err); // Passa o erro para o middleware de tratamento de erros
  }
};

module.exports = usersController;
