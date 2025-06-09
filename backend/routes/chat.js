const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat');
const verifyJWT = require('../middlewares/verifyJWT');

// Todas as rotas requerem autenticação
router.use(verifyJWT);

// Iniciar conversa
router.post('/conversation', chatController.startConversation);

// Buscar conversas do utilizador autenticado
router.get('/conversations', chatController.getUserConversations);

// Buscar mensagens de uma conversa
router.get('/messages/:conversationId', chatController.getMessages);

// Enviar mensagem
router.post('/message', chatController.sendMessage);

module.exports = router;
