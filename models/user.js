const mongoose = require('mongoose');

const User = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { 
    type: String, 
    required: function() { return !this.googleId && !this.facebookId; }
  },
  clienteTelemovel: { 
    type: String, 
    match: /^[0-9]{9}$/, 
    required: function() { return this.role === 'cliente' && !this.googleId && !this.facebookId; } 
  },
  managerTelemovel: {
    type: String, 
    match: /^[0-9]{9}$/, 
    required: function() { return this.role === 'manager' && !this.googleId && !this.facebookId; } 
  },
  clienteNif: { 
    type: String, 
    match: /^[0-9]{9}$/, 
    required: function() { return this.role === 'cliente' && !this.googleId && !this.facebookId; } 
  },
  address: { 
    type: String, 
    required: function() { return this.role === 'cliente' && !this.googleId && !this.facebookId; } 
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