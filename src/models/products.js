const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({ name: String, description : String, cost : Number, category : String, nome : String, img:
    {
        data: Buffer,
        contentType: String
    }})

module.exports = mongoose.model("Product", productSchema);