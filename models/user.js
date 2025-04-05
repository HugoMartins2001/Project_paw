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
    default: 'cliente',
    required: function() { return !this.googleId && !this.facebookId; } 
  },
  googleId: { type: String, unique: true, sparse: true }, 
  facebookId: { type: String, unique: true, sparse: true }, 
  dataRegisto: { type: Date, default: Date.now }
});

module.exports = mongoose.model('users', User);