const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type : String , required : true},
    description: { type : String , required : true, default: "No description provided"},
    cost: {type : Number, min : 0, required : true},
    category: {type : String, required : true},
    img: {
        data: String,
        contentType: String,
        required: true
    }
})

module.exports = mongoose.model("Product", productSchema);