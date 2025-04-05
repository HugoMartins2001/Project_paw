const mongoose = require('mongoose');

const User = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
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
  role: { type: String, enum: ["cliente", "manager", "admin"], required: true },
});

module.exports = mongoose.model('users', User);