const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    { 
        products: {type: Array, required: true }, 
        userId: { type: 'ObjectId', ref: 'User', required: true }, 
        accepted: {type: Boolean, default: null }, 
        userName: { type: String, required: true }, 
        indirizzo: { type: Object, required: false },
    }, 
    { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);