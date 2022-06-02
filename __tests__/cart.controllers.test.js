// https://mongoosejs.com/docs/jest.html#timer-mocks
const time = require('../src/time');
const sinon = require('sinon');
const fs = require('fs');
const path = require('path');
sinon.stub(time, 'setTimeout');

// https://www.npmjs.com/package/supertest
const request = require('supertest');
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const app = require('../index');

var token;

let email = 'a.a@gmail.com'
let pw = 'admin'
jest.setTimeout(15000);

test('app module should be defined', () => {
    expect(app).toBeDefined();
});

beforeAll((done) => {
    request(app)
        .post('/api/v1/users/login')
        .send({
            email: email,
            password: pw,
        })
        .end((err, response) => {
            token = response.body.token; // save the token!
            done();
        });
});

afterAll(async () => {})

describe('POST /api/v1/cart', () => {
    it('Successfully add product to cart', async () => {
        const response = await request(app)
            .post('/api/v1/cart')
            .set('Authorization', `Bearer ${token}`)
            .send({
                productId : 'zzzzzzzzzzzzzzzz',
                quantity : 10
            });

            expect(response.statusCode).toBe(201);

    });

    it('Successfully edit product quantity in cart', async () => {
        const response = await request(app)
            .post('/api/v1/cart')
            .set('Authorization', `Bearer ${token}`)
            .send({
                productId : "62975f99628ff2a5c4b579d8",
                quantity : 10
            });

            expect(response.statusCode).toBe(200);

    });

    it('Unsuccessfully add product to cart', async () => {
        const response = await request(app)
            .post('/api/v1/cart')
            .set('Authorization', `Bearer ${token}`)
            .send({
                productId : 'zzzzzzzzzzzzzzz',
                quantity : 10
            });

            expect(response.statusCode).toBe(404);

    });
    it('Unsuccessfully add product to cart, missing parameters', async () => {
        const response = await request(app)
            .post('/api/v1/cart')
            .set('Authorization', `Bearer ${token}`)
            .send({
                quantity : 10
            });

            expect(response.statusCode).toBe(400);

    });
    it('Unsuccessfully add product to cart, negative quantity', async () => {
        const response = await request(app)
            .post('/api/v1/cart')
            .set('Authorization', `Bearer ${token}`)
            .send({
                productId : 'zzzzzzzzzzzzzzz',
                quantity : -1
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
            .set('Authorization', `Bearer ${token}`)
        expect(response.status).toBe(200);
    });
});

describe('GET /api/v1/cart/quantity', () => {
    it('Successfully get products quantity', async () => {
        const response = await request(app)
            .get('/api/v1/cart/quantity')
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
    });
});

// Test PATCH /cart/:id
describe('PATCH /api/v1/cart/:id', () => {
    it('Successfully edit product quantity in cart', async () => {
        expect.assertions(1);

        const response = await request(app)
            .patch('/api/v1/cart/5e7b7d6e0f7b7f6b8c6c9d6d')
            .set('Authorization', `Bearer ${token}`)
            .send({
                quantity: 1
            });
        expect(response.status).toBe(200);
    });

    it('Unsuccessfully edit product quantity in cart', async () => {
        expect.assertions(1);

        const response = await request(app)
            .patch('/api/v1/cart/zzzzzzzzzzzzzzzzzzzzzzzz')
            .set('Authorization', `Bearer ${token}`)
            .send({
                quantity: 1,
                productId : 'zzzzzzzzzzzzzzzz',
            });
        expect(response.status).toBe(404);
    });
});

describe('DELETE /api/v1/cart/:id', () => {
    it('Successfully delete product', async () => {
        const response = await request(app)
            .delete('/api/v1/cart/5e7b7d6e0f7b7f6b8c6c9d6d')
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
    });
    it('Unsuccessfully delete product', async () => {
        const response = await request(app)
            .delete('/api/v1/cart/zzzzzzzzzzzzzzzzzzzzzzzz')
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(404);
    });
});