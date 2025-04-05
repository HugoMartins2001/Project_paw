const mongoose = require('mongoose');

const User = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { 
    type: String, 
    required: function() { return !this.googleId && !this.facebookId; } // Opcional para login social
  },
  clienteTelemovel: { 
    type: String, 
    match: /^[0-9]{9}$/, 
    required: function() { return this.role === 'cliente'; } 
  },
  managerTelemovel: {
    type: String, 
    match: /^[0-9]{9}$/, 
    required: function() { return this.role === 'manager'; } 
  },
  clienteNif: { 
    type: String, 
    match: /^[0-9]{9}$/, 
    required: function() { return this.role === 'cliente'; } 
  },
  address: { 
    type: String, 
    required: function() { return this.role === 'cliente'; } 
  },
  role: { 
    type: String, 
    enum: ["cliente", "manager", "admin"], 
    required: function() { return !this.googleId && !this.facebookId; } // Opcional para login social
  },
  googleId: { type: String, unique: true, sparse: true }, // ID único do Google
  facebookId: { type: String, unique: true, sparse: true }, // ID único do Facebook
  dataRegisto: { type: Date, default: Date.now } // Data de criação do usuário
});

module.exports = mongoose.model('users', User);