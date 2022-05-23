const mongoose = require('mongoose');
const Product = require("../models/products");
const User = require("../models/users");
const cartSchema = new mongoose.Schema({ productId: { type: 'ObjectId', ref: 'Product' }, userId : { type: 'ObjectId', ref: 'User' }, quantity: Number });

module.exports = mongoose.model("Cart", cartSchema);