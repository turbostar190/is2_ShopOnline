const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    nome: { type: String, required: true },
    admin: { type: Boolean, default: false },
    indirizzo: { type: Object, default: false },
});

module.exports = mongoose.model("User", userSchema);