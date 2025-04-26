const mongoose = require('mongoose');

const User = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: {
    type: String, 
    required: function() { return !this.googleId; } 
  },
  clienteTelemovel: { 
    type: String, 
    match: /^[0-9]{9}$/, 
    required: function() { return this.role === 'Client'; } 
  },
  managerTelemovel: {
    type: String, 
    match: /^[0-9]{9}$/, 
    required: function() { return this.role === 'Manager'; } 
  },
  clienteNif: { 
    type: String,
    match: /^[0-9]{9}$/, 
    required: function() { return this.role === 'Client'; } 
  },
  address: { 
    type: String, 
    required: function() { return this.role === 'Client'; } 
  },
  role: { 
    type: String, 
    enum: ["Client", "Manager", "Admin"], 
    default: 'Client',
    required: function() { return !this.googleId; } 
  },
  googleId: { type: String, unique: true, sparse: true }, 
  createdAt: { type: Date, default: Date.now },
  profilePic: { type: String },
  isBlocked: { type: Boolean, default: false }, // Campo para bloquear o usuário
});

module.exports = mongoose.model('users', User);