const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    products: Array,
    userId: {
        type: 'ObjectId',
        ref: 'User',
        required: true
    },
    accepted: {type : Boolean, default: null, required: true},
    userName: {type : String, required: true},
});

module.exports = mongoose.model("Order", orderSchema);