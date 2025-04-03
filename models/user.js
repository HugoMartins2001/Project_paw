const mongoose = require('mongoose');

const User = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  telemovel: { 
    type: String, 
    match: /^[0-9]{9}$/, 
    required: function() { return this.role === 'cliente'; } 
  },
  nif: { 
    type: String, 
    match: /^[0-9]{9}$/, 
    required: function() { return this.role === 'cliente'; } 
  },
  address: { 
    type: String, 
    required: function() { return this.role === 'manager'; } 
  },
  postalCode: { 
    type: String, 
    match: /^[0-9]{4}-[0-9]{3}$/, 
    required: function() { return this.role === 'manager'; } 
  },
  city: { 
    type: String, 
    required: function() { return this.role === 'manager'; } 
  },
  department: { 
    type: String, 
    required: function() { return this.role === 'manager'; } 
  },
  managerCode: { 
    type: String, 
    required: function() { return this.role === 'manager'; } 
  },
  role: { type: String, enum: ["cliente", "manager"], required: true },
});

module.exports = mongoose.model('users', User);