const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({ products: Array, userId : { type: 'ObjectId', ref: 'User' }});

module.exports = mongoose.model("Order", orderSchema);