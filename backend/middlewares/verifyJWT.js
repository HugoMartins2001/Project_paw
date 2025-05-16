const jwt = require("jsonwebtoken");
const config = require("../jwt_secret/config");
const User = require("../models/user");

module.exports = async function verifyJWT(req, res, next) {
  // Obtém o token de autenticação dos cookies
  const token = req.cookies["auth-token"];
  if (!token) return res.json({ redirect: "/auth/login" }); // Redireciona para login se o token não estiver presente 

  try {
    // Verifica e decodifica o token JWT usando a chave secreta
    const decoded = jwt.verify(token, config.secret);

    // Busca o usuário no banco de dados com base no email decodificado do token
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      // Se o usuário não for encontrado, redireciona para a página de login
      return res.json({ redirect: "/auth/login" });
    }

    // Adiciona o usuário autenticado ao objeto `req` para uso posterior
    req.user = user;
    next(); // Passa para o próximo middleware ou controlador
  } catch (err) {
    // Lida com erros na verificação do token JWT
    console.error("Error veryfing JWT:", err);
    return res.json({ redirect: "/auth/login" });
  }
};
