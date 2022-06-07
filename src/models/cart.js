const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({ 
    productId: { type: 'ObjectId', ref: 'Product', required: true }, 
    userId: { type: 'ObjectId', ref: 'User', required: true }, 
    quantity: { type: Number, required: true, min: 1 }
});

module.exports = mongoose.model("Cart", cartSchema);