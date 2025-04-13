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
    required: function() { return this.role === 'Cliente'; } 
  },
  managerTelemovel: {
    type: String, 
    match: /^[0-9]{9}$/, 
    required: function() { return this.role === 'manager'; } 
  },
  clienteNif: { 
    type: String,
    match: /^[0-9]{9}$/, 
    required: function() { return this.role === 'Cliente'; } 
  },
  address: { 
    type: String, 
    required: function() { return this.role === 'Cliente'; } 
  },
  role: { 
    type: String, 
    enum: ["Cliente", "Manager", "Admin"], 
    default: 'Cliente',
    required: function() { return !this.googleId; } 
  },
  googleId: { type: String, unique: true, sparse: true }, 
  dataRegisto: { type: Date, default: Date.now },
  profilePic: { type: String }
});

module.exports = mongoose.model('users', User);