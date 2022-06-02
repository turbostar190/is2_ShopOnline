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
    email: "test@test.test",
    password: bcrypt.hashSync("new-password", 10),
    nome: "Test User",
    indirizzo: null,
    admin: true
});

const test_product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: 'Test Product',
    description: 'Test Description',
    cost: 10,
    category: 'Test Category',
    nome: 'Test User',
});

var TOKEN;

test('app module should be defined', () => {
    expect(app).toBeDefined();
});

beforeAll(async () => {

    jest.setTimeout(10000);
    connectDB();

    admin_user.save();
    test_product.save();

    // retrieve token for authentication
    const login = await request(app)
        .post('/api/v1/users/login')
        .send({
            email: admin_user.email,
            password: "new-password",
        })

    TOKEN = login.body.token;

});

afterAll(async () => {
    disconnectDB();
    server.close();
})


describe('POST /products', () => {
    it('created a product successfully', async () => {
        //TODO: random name
        const response = await request(app)
            .post('/api/v1/products')
            .set('Content-Type', 'form-data')
            .set('Authorization', `Bearer ${TOKEN}`)
            .field('name', 'product2')
            .field('description', 'product')
            .field('cost', 10)
            .field('category', 'product')
            .attach('img', './__tests__/test_image.png')
            .expect(201);
    }
    );
    it('Unsuccessfully created a product for missing parameters', async () => {
        //TODO: random name
        const response = await request(app)
            .post('/api/v1/products')
            .set('Content-Type', 'form-data')
            .set('Authorization', `Bearer ${TOKEN}`)
            .field('name', 'product2')
            .field('description', 'product')
            .field('cost', 10)
            .expect(400);
    }
    );
    it('Unsuccessfully created a products for name already used', async () => {
        //TODO: assert product should exist
        const response = await request(app)
            .post('/api/v1/products')
            .set('Authorization', `Bearer ${TOKEN}`)
            .set('Content-Type', 'form-data')
            .field('name', test_product.name)
            .field('description', test_product.description)
            .field('cost', test_product.cost)
            .field('category', test_product.category)
            .attach('img', './__tests__/test_image.png')
            .expect(403);
    }
    );
    it('Unsuccessfully created a products for invalid parameter', async () => {

        const response = await request(app)
            .post('/api/v1/products')
            .set('Content-Type', 'form-data')
            .set('Authorization', `Bearer ${TOKEN}`)
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
    it('successfully get all products anonymously', async () => {
        const response = await request(app)
            .get('/api/v1/products')
            .expect(200);
    }
    );
    it('successfully get all products as logged user', async () => {
        const response = await request(app)
            .get('/api/v1/products')
            .set('Authorization', `Bearer ${TOKEN}`)
            .expect(200);
    }
    );
}
);

describe('GET /products/:id', () => {
    it('successfully get product by id', async () => {
        const response = await request(app)
            .get(`/api/v1/products/${test_product._id}`)
            .set('Authorization', `Bearer ${TOKEN}`)
            .expect(200);
    }
    );
    it('unsuccessfully get product by id', async () => {
        const response = await request(app)
            .get('/api/v1/products/zzzzzzzzzzzzzzzzzzzzzz')
            .set('Authorization', `Bearer ${TOKEN}`)
            .expect(404);
    }
    );
}
);

describe('PATCH /products/:id', () => {
    it('successfully edited product by id', async () => {

        const response = await request(app)
            .patch(`/api/v1/products/${test_product._id}`)
            .set('Content-Type', 'form-data')
            .set('Authorization', `Bearer ${TOKEN}`)
            .field('name', test_product.name)
            .field('description', test_product.description)
            .field('cost', test_product.cost)
            .field('category', test_product.category)
            .attach('img', './__tests__/test_image.png')
            .expect(200);
    }
    );
    it('unsuccessfully edited product by id, negative cost', async () => {
        const response = await request(app)
            .patch(`/api/v1/products/${test_product._id}`)
            .set('Content-Type', 'form-data')
            .set('Authorization', `Bearer ${TOKEN}`)
            .field('name', 'product2')
            .field('description', 'product')
            .field('cost', -10)
            .field('category', 'product')
            .attach('img', './__tests__/test_image.png')
            .expect(400);
    }
    );
    it('unsuccessfully edited product by id, unauthorized', async () => {
        const response = await request(app)
            .patch(`/api/v1/products/${test_product._id}`)
            .set('Content-Type', 'form-data')
            .field('name', 'product2')
            .field('description', 'product')
            .field('cost', 10)
            .field('category', 'product')
            .attach('img', './__tests__/test_image.png')
            .expect(401);
    }
    );
    it('unsuccessfully edited product by id, product don\'t exists', async () => {
        const response = await request(app)
            .patch('/api/v1/products/zzzzzzzzzzzzzzzzzzzzzz')
            .set('Content-Type', 'form-data')
            .set('Authorization', `Bearer ${TOKEN}`)
            .field('name', 'product2')
            .field('description', 'product')
            .field('cost', 10)
            .field('category', 'product')
            .attach('img', './__tests__/test_image.png')
            .expect(404);
    }
    );
}
);

describe('DELETE /products/:id', () => {
    it('unsuccessfully get product by id, not found', async () => {
        const response = await request(app)
            .delete('/api/v1/products/zzzzzzzzzzzzzzzzzzzzzz')
            .set('Authorization', `Bearer ${TOKEN}`)
            .expect(404);
    }
    );
    it('unsuccessfully get product by id, unauthorized', async () => {
        const response = await request(app)
            .delete('/api/v1/products/zzzzzzzzzzzzzzzzzzzzzz')
            .expect(401);
    }
    );
    it('successfully deleted product by id', async () => {

        const response = await request(app)
            .delete(`/api/v1/products/${test_product._id}`)
            .set('Authorization', `Bearer ${TOKEN}`)
            .expect(200);
    }
    );
}
);