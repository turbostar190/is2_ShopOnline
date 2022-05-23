const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({ products: Array, userId : { type: 'ObjectId', ref: 'User' }, accepted : Boolean, userName : String, timestamp : Number });

module.exports = mongoose.model("Order", orderSchema);