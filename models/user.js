const mongoose = require('mongoose')

const User = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  telemovel: { type: String, required: true, match: /^[0-9]{9}$/ },
  nif: { type: String, required: true, match: /^[0-9]{9}$/ },
  role: { type: String, enum: ["cliente", "manager"], required: true },
})

module.exports = mongoose.model('users', User)