const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'O nome do restaurante é obrigatório'],
        trim: true,
    },
    address: {
        type: String,
        required: [true, 'O endereço do restaurante é obrigatório'],
        trim: true,
    },
    location: {
        latitude: {
            type: String,
            required: [true, 'A latitude é obrigatória'],
            validate: {
                validator: function (v) {
                    return /^-?\d+(\.\d+)?$/.test(v);
                },
                message: 'A latitude deve ser um número válido',
            },
        },
        longitude: {
            type: String,
            required: [true, 'A longitude é obrigatória'],
            validate: {
                validator: function (v) {
                    return /^-?\d+(\.\d+)?$/.test(v); 
                },
                message: 'A longitude deve ser um número válido',
            },
        },
    },
    contact: {
        type: String,
        required: [true, 'O telefone do restaurante é obrigatório'],
        validate: {
            validator: function (v) {
                return /^[0-9]{9}$/.test(v);
            },
            message: 'O telefone deve ter 9 dígitos',
        },
    },
    email: {
        type: String,
        required: [true, 'O email do restaurante é obrigatório'],
        validate: {
            validator: function (v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: 'O email deve ser válido',
        },
    },
    logo: {
        type: String,
        required: [true, 'A URL da imagem/logo é obrigatória'],
        validate: {
            validator: function (v) {
                return /^(https?:\/\/.*\.(?:png|jpg|jpeg|svg))$/.test(v);
            },
            message: 'A URL da imagem/logo deve ser válida',
        },
    },
    openingHours: {
        type: String,
        required: [true, 'O horário de funcionamento é obrigatório'],
        trim: true,
    },
    paymentMethods: {
        type: String,
        required: [true, 'Os métodos de pagamento são obrigatórios'],
        trim: true,
    },
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);