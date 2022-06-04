const mongoose = require('mongoose');
const Product = require("../models/products");
const User = require("../models/users");

const cartSchema = new mongoose.Schema({ 
    productId: { type: 'ObjectId', ref: 'Product', required: true }, 
    userId: { type: 'ObjectId', ref: 'User', required: true }, 
    quantity: { type: Number, required: true, min: 1 }
});

module.exports = mongoose.model("Cart", cartSchema);