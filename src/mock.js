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
});

const TEST_PRODUCT_2 = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: 'Test Product 2',
    description: 'Test Description 2',
    cost: 10,
    category: 'Test Category 2',
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
    userName: NORMAL_USER.nome
});

const ORDER_2 = new Order({
    _id: new mongoose.Types.ObjectId(),
    accepted: null,
    userId: NORMAL_USER._id,
    products: [TEST_PRODUCT, TEST_PRODUCT],
    userName: NORMAL_USER.nome
});

const EXPIRED_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MjgyNmQxN2E4ZGVjYTVhYjQxOGRjMDEiLCJlbWFpbCI6ImEuYUBnbWFpbC5jb20iLCJub21lIjoiRnJhbmNlc2NvIiwiYWRtaW4iOnRydWUsImlhdCI6MTY1NDE4MDk0NCwiZXhwIjoxNjU0MjY3MzQ0fQ.CXit3yOGSUl8tg-R0Mecn5VYIGlqubX-qS_vFUghnVs'

module.exports = { ADMIN_USER, NORMAL_USER, NORMAL_USER_2, TEST_PRODUCT, TEST_PRODUCT_2, TEST_PASSWORD, NORMAL_CART, ORDER_1, ORDER_2, EXPIRED_TOKEN};