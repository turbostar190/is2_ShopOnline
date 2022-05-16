const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({ email: String, password : String, nome : String, cart : Array})

module.exports = mongoose.model("User", userSchema);