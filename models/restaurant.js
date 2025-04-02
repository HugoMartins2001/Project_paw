const mongoose = require('mongoose')

const RestaurantSchema = new mongoose.Schema({
    name:String,
    description:String,
    address:String,
    contact:String
})

module.exports = mongoose.model('Restaurant', RestaurantSchema)