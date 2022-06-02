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

var TOKEN;

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

    it('Add OK', async () => {

        const response = await request(app)
            .post('/api/v1/cart')
            .set('Authorization', `Bearer ${TOKEN}`)
            .send({
                productId: test_product._id,
                quantity: 3
            });

        expect(response.statusCode).toBe(201);

    });

    it('Modify quantity OK', async () => {
        const response = await request(app)
            .post('/api/v1/cart')
            .set('Authorization', `Bearer ${TOKEN}`)
            .send({
                productId: test_product._id,
                quantity: 10
            });

        expect(response.statusCode).toBe(200);

    });

    it('Add unknown ID', async () => {
        const response = await request(app)
            .post('/api/v1/cart')
            .set('Authorization', `Bearer ${TOKEN}`)
            .send({
                productId: 'not-working-id',
                quantity: 10
            });

        expect(response.statusCode).toBe(404);

    });
    it('Missing Parameters', async () => {
        const response = await request(app)
            .post('/api/v1/cart')
            .set('Authorization', `Bearer ${TOKEN}`)
            .send({
                quantity: 10
            });

        expect(response.statusCode).toBe(400);

    });
    it('Modify with negative quantity', async () => {
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

    it('Anonymous OK', async () => {
        const response = await request(app)
            .get('/api/v1/cart')
        expect(response.status).toBe(400);
    });

    it('Logged OK', async () => {
        const response = await request(app)
            .get('/api/v1/cart')
            .set('Authorization', `Bearer ${TOKEN}`)
        expect(response.status).toBe(200);
    });
});

describe('GET /api/v1/cart/quantity', () => {
    it('OK', async () => {
        const response = await request(app)
            .get('/api/v1/cart/quantity')
            .set('Authorization', `Bearer ${TOKEN}`);
        expect(response.status).toBe(200);
    });
});

// Test PATCH /cart/
describe('PATCH /api/v1/cart/', () => {

    it('OK', async () => {
        const response = await request(app)
            .patch(`/api/v1/cart/`)
            .set('Authorization', `Bearer ${TOKEN}`)
            .send({
                productId: test_product._id,
                quantity: 1
            });
        expect(response.status).toBe(200);
    });

    it('Modify unknown ID', async () => {
        const response = await request(app)
            .patch('/api/v1/cart/')
            .set('Authorization', `Bearer ${TOKEN}`)
            .send({
                quantity: 1,
                productId: 'not-working-id',
            });
        expect(response.status).toBe(404);
    });
});

describe('DELETE /api/v1/cart/', () => {

    // delete product without id
    it('No ID provided', async () => {
        const response = await request(app)
            .delete('/api/v1/cart/')
            .set('Authorization', `Bearer ${TOKEN}`);
        expect(response.status).toBe(400);
    });

    it('OK', async () => {
        const response = await request(app)
            .delete(`/api/v1/cart/`)
            .set('Authorization', `Bearer ${TOKEN}`)
            .send({
                productId: test_product._id,
            });
        expect(response.status).toBe(200);
    });

    it('Unknown ID', async () => {
        const response = await request(app)
            .delete('/api/v1/cart/')
            .set('Authorization', `Bearer ${TOKEN}`)
            .send({
                productId: 'wrong-product-id',
            });
        expect(response.status).toBe(404);
    });
});