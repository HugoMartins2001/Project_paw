// Carrega as variáveis de ambiente do arquivo .env para o processo Node.js
require("dotenv").config();

// Exporta a chave secreta usada para assinar e verificar tokens JWT
module.exports = {
  secret: process.env.JWT_SECRET, // Obtém o valor da variável de ambiente JWT_SECRET
};
