const multer = require('multer');
const path = require('path');

// Configuração do armazenamento para os arquivos enviados
const storage = multer.diskStorage({
  // Define o diretório onde os arquivos serão armazenados
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/'); // Salva os arquivos na pasta 'public/uploads/'
  },
  // Define o nome do arquivo armazenado
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); // Gera um sufixo único baseado no timestamp e um número aleatório
    const ext = path.extname(file.originalname); // Obtém a extensão do arquivo original
    cb(null, file.fieldname + '-' + uniqueSuffix + ext); // Define o nome do arquivo como 'fieldname-timestamp-extensão'
  }
});

// Filtro para aceitar apenas arquivos de imagem
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true); // Aceita o arquivo se for uma imagem
  } else {
    cb(new Error("Only image files are allowed!"), false); // Rejeita o arquivo com um erro se não for uma imagem
  }
};

// Configuração do middleware de upload com armazenamento e filtro
const upload = multer({ 
  storage: storage, // Define o armazenamento configurado acima
  fileFilter: fileFilter // Aplica o filtro para aceitar apenas imagens
});

module.exports = upload; // Exporta o middleware para ser usado em outros arquivos
