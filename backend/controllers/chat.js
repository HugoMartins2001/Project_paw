const Conversation = require('../models/conversation');
const Message = require('../models/message');
const User = require('../models/user');

// Criar nova conversa (ou obter existente)
exports.startConversation = async (req, res) => {
  try {
    const { participantIds, type } = req.body;
    let conversation = await Conversation.findOne({
      participants: { $all: participantIds, $size: participantIds.length },
      type
    });
    if (!conversation) {
      conversation = await Conversation.create({ participants: participantIds, type });
    }
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Buscar conversas do utilizador (com nome e foto dos participantes)
exports.getUserConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversations = await Conversation.find({ participants: userId })
      .populate('participants', 'name role profilePic email')
      .populate('lastMessage');
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Buscar mensagens de uma conversa (com anexos)
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name role profilePic email')
      .populate('recipient', 'name role profilePic email')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Enviar mensagem (com suporte a anexos)
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, text, recipientId, attachment } = req.body;
    const senderId = req.user._id;
    const message = await Message.create({
      conversation: conversationId,
      sender: senderId,
      recipient: recipientId,
      text,
      attachment
    });
    await Conversation.findByIdAndUpdate(conversationId, { lastMessage: message._id });
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
