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

const admin_user = new User({
    _id: new mongoose.Types.ObjectId(),
    email: "admin@test.test",
    password: bcrypt.hashSync("new-password", 10),
    nome: "Test User",
    indirizzo: null,
    admin: true
});

const normal_user = new User({
    _id: new mongoose.Types.ObjectId(),
    email: "normal@test.test",
    password: bcrypt.hashSync("new-password", 10),
    nome: "Normal User",
    indirizzo: null,
    admin: false
});

const test_product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: 'Test Product',
    description: 'Test Description',
    cost: 10,
    category: 'Test Category',
    nome: 'Test User',
});

var ADMIN_TOKEN;
var NORMAL_TOKEN;

test('app module should be defined', () => {
    expect(app).toBeDefined();
});

beforeAll(async () => {

    jest.setTimeout(10000);
    connectDB();

    admin_user.save();
    normal_user.save();
    test_product.save();

    // retrieve token for authentication
    const login = await request(app)
        .post('/api/v1/users/login')
        .send({
            email: admin_user.email,
            password: "new-password",
        })

    ADMIN_TOKEN = login.body.token;

    const normal_login = await request(app)
        .post('/api/v1/users/login')
        .send({
            email: normal_user.email,
            password: "new-password",
        })

    NORMAL_TOKEN = normal_login.body.token;

});

afterAll(async () => {
    disconnectDB();
    server.close();
})


describe('POST /products', () => {
    it('OK', async () => {
        //TODO: random name
        const response = await request(app)
            .post('/api/v1/products')
            .set('Content-Type', 'form-data')
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
            .field('name', 'product2')
            .field('description', 'product')
            .field('cost', 10)
            .field('category', 'product')
            .attach('img', './__tests__/test_image.png')
            .expect(201);
    }
    );
    it('Missing Parameters', async () => {
        //TODO: random name
        const response = await request(app)
            .post('/api/v1/products')
            .set('Content-Type', 'form-data')
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
            .field('name', 'product2')
            .field('description', 'product')
            .field('cost', 10)
            .expect(400);
    }
    );
    it('Product already exists', async () => {
        //TODO: assert product should exist
        const response = await request(app)
            .post('/api/v1/products')
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
            .set('Content-Type', 'form-data')
            .field('name', test_product.name)
            .field('description', test_product.description)
            .field('cost', test_product.cost)
            .field('category', test_product.category)
            .attach('img', './__tests__/test_image.png')
            .expect(403);
    }
    );
    it('Invalid quantity parameter', async () => {

        const response = await request(app)
            .post('/api/v1/products')
            .set('Content-Type', 'form-data')
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
            .field('name', 'product2')
            .field('description', 'product')
            .field('cost', -110)
            .field('category', 'product')
            .attach('img', './__tests__/test_image.png')
            .expect(400);
    }
    );
});

describe('GET /products', () => {
    it('Anonymous OK', async () => {
        const response = await request(app)
            .get('/api/v1/products')
            .expect(200);
    }
    );
    it('Logged OK', async () => {
        const response = await request(app)
            .get('/api/v1/products')
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
            .expect(200);
    }
    );
}
);

describe('GET /products/:id', () => {

    it('OK', async () => {
        const response = await request(app)
            .get(`/api/v1/products/${test_product._id}`)
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
            .expect(200);
    });

    it('Invalid ID', async () => {
        const response = await request(app)
            .get('/api/v1/products/invalid-id')
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
            .expect(400);
    });

    it('Unknown ID', async () => {
        const response = await request(app)
            .get('/api/v1/products/987654321098765432101234')
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
            .expect(404);
    });

});

describe('PUT /products/:id', () => {
    it('OK', async () => {

        const response = await request(app)
            .put(`/api/v1/products/${test_product._id}`)
            .set('Content-Type', 'form-data')
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
            .field('name', test_product.name)
            .field('description', test_product.description)
            .field('cost', test_product.cost)
            .field('category', test_product.category)
            .attach('img', './__tests__/test_image.png')
            .expect(200);
    });
    it('Negative cost', async () => {
        const response = await request(app)
            .put(`/api/v1/products/${test_product._id}`)
            .set('Content-Type', 'form-data')
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
            .field('name', 'product2')
            .field('description', 'product')
            .field('cost', -10)
            .field('category', 'product')
            .attach('img', './__tests__/test_image.png')
            .expect(400);
    }
    );
    it('Unauthorized', async () => {
        const response = await request(app)
            .put(`/api/v1/products/${test_product._id}`)
            .set('Authorization', `Bearer ${NORMAL_TOKEN}`)
            .set('Content-Type', 'form-data')
            .field('name', test_product.name)
            .field('description', test_product.description)
            .field('cost', test_product.cost)
            .field('category', test_product.category)
            .attach('img', './__tests__/test_image.png')
            .expect(401);
    });

    it('Invalid ID', async () => {
        const response = await request(app)
            .put('/api/v1/products/zzzzzzzzzzzzzzzzzzzzzz')
            .set('Content-Type', 'form-data')
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
            .field('name', 'product2')
            .field('description', 'product')
            .field('cost', 10)
            .field('category', 'product')
            .attach('img', './__tests__/test_image.png')
            .expect(400);
    });

    it('Unknown ID', async () => {
        const response = await request(app)
            .put('/api/v1/products/987654321098765432101234')
            .set('Content-Type', 'form-data')
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
            .field('name', 'product2')
            .field('description', 'product')
            .field('cost', 10)
            .field('category', 'product')
            .attach('img', './__tests__/test_image.png')
            .expect(404);
    });
});

describe('DELETE /products/:id', () => {
    it('Invalid ID', async () => {
        const response = await request(app)
            .delete('/api/v1/products/zzzzzzzzzzzzzzzzzzzzzz')
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
            .expect(400);
    });

    it('Unknown ID', async () => {
        const response = await request(app)
            .delete('/api/v1/products/987654321098765432101234')
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
            .expect(404);
    });

    it('Unauthorized', async () => {
        const response = await request(app)
            .delete(`/api/v1/products/${test_product._id}`)
            .set('Authorization', `Bearer ${NORMAL_TOKEN}`)
            .expect(401);
    });

    it('OK', async () => {
        const response = await request(app)
            .delete(`/api/v1/products/${test_product._id}`)
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
            .expect(204);
    });
});