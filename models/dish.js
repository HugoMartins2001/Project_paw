const mongoose = require('mongoose');

const DishSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, enum: ['entrada', 'prato principal', 'sobremesa', 'bebida'], required: true },
    ingredients: { type: [String], required: true },
    image: { type: String }
});

module.exports = mongoose.model('Dish', DishSchema);