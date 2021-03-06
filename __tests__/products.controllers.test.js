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

const { connectDB, disconnectDB } = require('../src/database');
const { ADMIN_USER, NORMAL_USER, TEST_PASSWORD, TEST_PRODUCT } = require('../src/mock');

var ADMIN_TOKEN;
var NORMAL_TOKEN;

test('app module should be defined', () => {
    expect(app).toBeDefined();
});

beforeAll(async () => {

    jest.setTimeout(10000);
    connectDB();

    ADMIN_USER.save();
    NORMAL_USER.save();
    TEST_PRODUCT.save();

    // retrieve token for authentication
    const login = await request(app)
        .post('/api/v2/users/login')
        .send({
            email: ADMIN_USER.email,
            password: TEST_PASSWORD,
        })

    ADMIN_TOKEN = login.body.token;

    const normal_login = await request(app)
        .post('/api/v2/users/login')
        .send({
            email: NORMAL_USER.email,
            password: TEST_PASSWORD,
        })

    NORMAL_TOKEN = normal_login.body.token;

});

afterAll(async () => {
    disconnectDB();
    server.close();
})


describe('POST /products', () => {

    it('OK', async () => {
        const response = await request(app)
            .post('/api/v2/products')
            .set('Content-Type', 'form-data')
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
            .field('name', 'product2')
            .field('description', 'product')
            .field('cost', 10)
            .field('category', 'product')
            .attach('img', './__tests__/test_image.png')
            .expect(201);
    });

    it('Unauthorized regular user', async () => {
        const response = await request(app)
            .post('/api/v2/products')
            .set('Content-Type', 'form-data')
            .set('Authorization', `Bearer ${NORMAL_TOKEN}`)
            .field('name', 'product2')
            .field('description', 'product')
            .field('cost', 10)
            .field('category', 'product')
            .attach('img', './__tests__/test_image.png')
            .expect(401);
    });

    it('Unauthorized Anomymous user', async () => {
        const response = await request(app)
            .post('/api/v2/products')
            .set('Content-Type', 'form-data')
            .field('name', 'product2')
            .field('description', 'product')
            .field('cost', 10)
            .field('category', 'product')
            .attach('img', './__tests__/test_image.png')
            .expect(401);
    });

    it('Missing Parameters', async () => {
        const response = await request(app)
            .post('/api/v2/products')
            .set('Content-Type', 'form-data')
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
            .field('name', 'product2')
            .field('description', 'product')
            .field('cost', 10)
            .expect(400);
    });

    it('Product already exists', async () => {
        const response = await request(app)
            .post('/api/v2/products')
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
            .set('Content-Type', 'form-data')
            .field('name', TEST_PRODUCT.name)
            .field('description', TEST_PRODUCT.description)
            .field('cost', TEST_PRODUCT.cost)
            .field('category', TEST_PRODUCT.category)
            .attach('img', './__tests__/test_image.png')
            .expect(403);
    });

    it('Invalid cost parameter', async () => {
        const response = await request(app)
            .post('/api/v2/products')
            .set('Content-Type', 'form-data')
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
            .field('name', 'product2')
            .field('description', 'product')
            .field('cost', -110)
            .field('category', 'product')
            .attach('img', './__tests__/test_image.png')
            .expect(400);
    });
});

describe('GET /categories', () => {

    it('Anonymous OK', async () => {
        const response = await request(app)
            .get('/api/v2/products/categories')
            .expect(200);
    });

    it('Logged OK', async () => {
        const response = await request(app)
            .get('/api/v2/products/categories')
            .set('Authorization', `Bearer ${NORMAL_TOKEN}`)
            .expect(200);
    });
});

describe('GET /products', () => {

    it('Anonymous OK', async () => {
        const response = await request(app)
            .get('/api/v2/products')
            .expect(200);
    });

    it('Logged OK', async () => {
        const response = await request(app)
            .get('/api/v2/products')
            .set('Authorization', `Bearer ${NORMAL_TOKEN}`)
            .expect(200);
    });

    it('Sort name', async () => {
        const response = await request(app)
            .get('/api/v2/products?sort=name')
            .expect(200);
    });

    it('Sort cost', async () => {
        const response = await request(app)
            .get('/api/v2/products?sort=cost')
            .expect(200);
    });

    it('Sort cost', async () => {
        const response = await request(app)
            .get('/api/v2/products?sort=cost')
            .expect(200);
    });

    it('Search product name', async () => {
        const response = await request(app)
            .get('/api/v2/products?search=product')
            .expect(200);
    });

    it('Search category name', async () => {
        const response = await request(app)
            .get('/api/v2/products?category=cat')
            .expect(200);
    });

});

describe('GET /products/:id', () => {

    it('OK', async () => {
        const response = await request(app)
            .get(`/api/v2/products/${TEST_PRODUCT._id}`)
            .expect(200);
    });

    it('Invalid ID', async () => {
        const response = await request(app)
            .get('/api/v2/products/invalid-id')
            .expect(400);
    });

    it('Unknown ID', async () => {
        const response = await request(app)
            .get('/api/v2/products/987654321098765432101234')
            .expect(404);
    });

});

describe('PUT /products/:id', () => {

    it('OK', async () => {
        const response = await request(app)
            .put(`/api/v2/products/${TEST_PRODUCT._id}`)
            .set('Content-Type', 'form-data')
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
            .field('name', TEST_PRODUCT.name)
            .field('description', TEST_PRODUCT.description)
            .field('cost', TEST_PRODUCT.cost)
            .field('category', TEST_PRODUCT.category)
            .attach('img', './__tests__/test_image.png')
            .expect(200);
    });

    it('Unauthorized anomymous user', async () => {
        const response = await request(app)
            .put(`/api/v2/products/${TEST_PRODUCT._id}`)
            .set('Content-Type', 'form-data')
            .field('name', 'product2')
            .field('description', 'product')
            .field('cost', 10)
            .field('category', 'product')
            .attach('img', './__tests__/test_image.png')
            .expect(401);
    });


    it('Negative cost', async () => {
        const response = await request(app)
            .put(`/api/v2/products/${TEST_PRODUCT._id}`)
            .set('Content-Type', 'form-data')
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
            .field('name', 'product2')
            .field('description', 'product')
            .field('cost', -10)
            .field('category', 'product')
            .attach('img', './__tests__/test_image.png')
            .expect(400);
    });

    it('Unauthorized regular user', async () => {
        const response = await request(app)
            .put(`/api/v2/products/${TEST_PRODUCT._id}`)
            .set('Authorization', `Bearer ${NORMAL_TOKEN}`)
            .set('Content-Type', 'form-data')
            .field('name', TEST_PRODUCT.name)
            .field('description', TEST_PRODUCT.description)
            .field('cost', TEST_PRODUCT.cost)
            .field('category', TEST_PRODUCT.category)
            .attach('img', './__tests__/test_image.png')
            .expect(401);
    });

    it('Invalid ID', async () => {
        const response = await request(app)
            .put('/api/v2/products/zzzzzzzzzzzzzzzzzzzzzz')
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
            .put('/api/v2/products/987654321098765432101234')
            .set('Content-Type', 'form-data')
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
            .field('name', 'product2')
            .field('description', 'product')
            .field('cost', 10)
            .field('category', 'product')
            .attach('img', './__tests__/test_image.png')
            .expect(404);
    });

    it('Missing ID', async () => {
        const response = await request(app)
            .put('/api/v2/products/')
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
            .delete('/api/v2/products/zzzzzzzzzzzzzzzzzzzzzz')
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
            .expect(400);
    });

    it('Unknown ID', async () => {
        const response = await request(app)
            .delete('/api/v2/products/987654321098765432101234')
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
            .expect(204);
    });

    it('Missing ID', async () => {
        const response = await request(app)
            .delete('/api/v2/products/')
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
            .expect(404);
    });

    it('Unauthorized regular user', async () => {
        const response = await request(app)
            .delete(`/api/v2/products/${TEST_PRODUCT._id}`)
            .set('Authorization', `Bearer ${NORMAL_TOKEN}`)
            .expect(401);
    });

    it('Unauthorized anonymous user', async () => {
        const response = await request(app)
            .delete(`/api/v2/products/${TEST_PRODUCT._id}`)
            .expect(401);
    });

    it('OK', async () => {
        const response = await request(app)
            .delete(`/api/v2/products/${TEST_PRODUCT._id}`)
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
            .expect(204);
    });
});