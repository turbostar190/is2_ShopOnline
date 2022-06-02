// https://mongoosejs.com/docs/jest.html#timer-mocks
const time = require('../src/time');
const sinon = require('sinon');
const fs = require('fs');
const path = require('path');
sinon.stub(time, 'setTimeout');

// https://www.npmjs.com/package/supertest
const request = require('supertest');
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const { app, server } = require('../index');

const { connectDB, disconnectDB } = require('../database');
const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const Product = require('../src/models/products');
const User = require('../src/models/users');
const { doesNotMatch } = require('assert');

var TOKEN;
var CART_ID;

const test_product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: 'Test Product',
    description: 'Test Description',
    cost: 10,
    category: 'Test Category',
    nome: 'Test User',
});

const user = new User({
    _id: new mongoose.Types.ObjectId(),
    email: "test@test.test",
    password: bcrypt.hashSync("new-password", 10),
    nome: "Test User",
    indirizzo: null,
});


test('app module should be defined', () => {
    expect(app).toBeDefined();
});

beforeAll(async () => {

    jest.setTimeout(10000);
    connectDB();

    test_product.save(); // save test product to database
    user.save(); // save test user to database

    // retrieve token for authentication
    const login = await request(app)
        .post('/api/v1/users/login')
        .send({
            email: user.email,
            password: "new-password",
        })

    TOKEN = login.body.token;

});

afterAll(async () => {
    disconnectDB();
    server.close();
})

describe('POST /api/v1/cart', () => {

    it('Successfully add product to cart', async () => {

        const response = await request(app)
            .post('/api/v1/cart')
            .set('Authorization', `Bearer ${TOKEN}`)
            .send({
                productId: test_product._id,
                quantity: 3
            });

        expect(response.statusCode).toBe(201);

    });

    it('Successfully edit product quantity in cart', async () => {
        const response = await request(app)
            .post('/api/v1/cart')
            .set('Authorization', `Bearer ${TOKEN}`)
            .send({
                productId: test_product._id,
                quantity: 10
            });

        expect(response.statusCode).toBe(200);

    });

    it('Unsuccessfully add product to cart', async () => {
        const response = await request(app)
            .post('/api/v1/cart')
            .set('Authorization', `Bearer ${TOKEN}`)
            .send({
                productId: 'not-working-id',
                quantity: 10
            });

        expect(response.statusCode).toBe(404);

    });
    it('Unsuccessfully add product to cart, missing parameters', async () => {
        const response = await request(app)
            .post('/api/v1/cart')
            .set('Authorization', `Bearer ${TOKEN}`)
            .send({
                quantity: 10
            });

        expect(response.statusCode).toBe(400);

    });
    it('Unsuccessfully add product to cart, negative quantity', async () => {
        const response = await request(app)
            .post('/api/v1/cart')
            .set('Authorization', `Bearer ${TOKEN}`)
            .send({
                productId: 'zzzzzzzzzzzzzzz',
                quantity: -1
            });

        expect(response.statusCode).toBe(400);

    });
})

describe('GET /api/v1/cart', () => {

    it('Unsuccessfully get cart anonymously', async () => {
        const response = await request(app)
            .get('/api/v1/cart')
        expect(response.status).toBe(400);
    });

    it('Successfully get cart as logged user', async () => {
        const response = await request(app)
            .get('/api/v1/cart')
            .set('Authorization', `Bearer ${TOKEN}`)
        expect(response.status).toBe(200);
    });
});

describe('GET /api/v1/cart/quantity', () => {
    it('Successfully get products quantity', async () => {
        const response = await request(app)
            .get('/api/v1/cart/quantity')
            .set('Authorization', `Bearer ${TOKEN}`);
        expect(response.status).toBe(200);
    });
});

// Test PATCH /cart/:id
describe('PATCH /api/v1/cart/:id', () => {

    it('Successfully edit product quantity in cart', async () => {
        const response = await request(app)
            .patch(`/api/v1/cart/${CART_ID}`)
            .set('Authorization', `Bearer ${TOKEN}`)
            .send({
                productId: test_product._id,
                quantity: 1
            });
        expect(response.status).toBe(200);
    });

    it('Unsuccessfully edit product quantity in cart', async () => {
        const response = await request(app)
            .patch('/api/v1/cart/zzzzzzzzzzzzzzzzzzzzzzzz')
            .set('Authorization', `Bearer ${TOKEN}`)
            .send({
                quantity: 1,
                productId: 'zzzzzzzzzzzzzzzz',
            });
        expect(response.status).toBe(404);
    });
});

describe('DELETE /api/v1/cart/:id', () => {

    it('Successfully delete product', async () => {
        const response = await request(app)
            .delete(`/api/v1/cart/${CART_ID}`)
            .set('Authorization', `Bearer ${TOKEN}`);
        expect(response.status).toBe(200);
    });

    it('Unsuccessfully delete product', async () => {
        const response = await request(app)
            .delete('/api/v1/cart/zzzzzzzzzzzzzzzzzzzzzzzz')
            .set('Authorization', `Bearer ${TOKEN}`);
        expect(response.status).toBe(404);
    });
});