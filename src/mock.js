const mongoose = require('mongoose');
const bcrypt = require("bcrypt");

const User = require('./models/users');
const Product = require('./models/products');
const Order = require('./models/orders');
const Cart = require('./models/cart');

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

const NORMAL_USER_2 = new User({
    _id: new mongoose.Types.ObjectId(),
    email: "normal2@test.test",
    password: bcrypt.hashSync(TEST_PASSWORD, 10),
    nome: "Normal User 2",
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

const NORMAL_CART = new Cart({
    _id: new mongoose.Types.ObjectId(),
    productId: TEST_PRODUCT._id,
    userId: NORMAL_USER._id,
    quantity: 1
});

const ORDER_1 = new Order({
    _id: new mongoose.Types.ObjectId(),
    accepted: null,
    userId: NORMAL_USER._id,
    products: [TEST_PRODUCT],
    timestamp: new Date(),
    userName: NORMAL_USER.nome
});

const ORDER_2 = new Order({
    _id: new mongoose.Types.ObjectId(),
    accepted: null,
    userId: NORMAL_USER._id,
    products: [TEST_PRODUCT, TEST_PRODUCT],
    timestamp: new Date(),
    userName: NORMAL_USER.nome
});



module.exports = { ADMIN_USER, NORMAL_USER, NORMAL_USER_2, TEST_PRODUCT, TEST_PASSWORD, NORMAL_CART, ORDER_1, ORDER_2 };