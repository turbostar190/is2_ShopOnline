const mongoose = require('mongoose');
const bcrypt = require("bcrypt");

const User = require('./models/users');
const Product = require('./models/products');
const Order = require('./models/orders');

const TEST_PASSWORD = "new-password";

const ADMIN_USER = new User({
    _id: new mongoose.Types.ObjectId(),
    email: "admin@test.test",
    password: bcrypt.hashSync(TEST_PASSWORD, 10),
    nome: "Test User",
    indirizzo: null,
    admin: true
});

const NORMAL_USER = new User({
    _id: new mongoose.Types.ObjectId(),
    email: "normal@test.test",
    password: bcrypt.hashSync(TEST_PASSWORD, 10),
    nome: "Normal User",
    indirizzo: null,
    admin: false
});

const TEST_PRODUCT = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: 'Test Product',
    description: 'Test Description',
    cost: 10,
    category: 'Test Category',
    nome: 'Test User',
});

module.exports = { ADMIN_USER, NORMAL_USER, TEST_PRODUCT, TEST_PASSWORD };