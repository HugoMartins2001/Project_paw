const mongoose = require('mongoose');

const DishSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, enum: ['carne', 'peixe', 'sobremesa', 'vegetariano'], required: true },
    ingredients: { type: [String], required: true }
});

module.exports = mongoose.model('Dish', DishSchema);