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
const { ADMIN_USER, NORMAL_USER, NORMAL_USER_2, TEST_PASSWORD, TEST_PRODUCT, NORMAL_CART, ORDER_1, ORDER_2 } = require('../src/mock');

test('app module should be defined', () => {
    expect(app).toBeDefined();
});

beforeAll(async () => {

    jest.setTimeout(15000);
    connectDB();

    ADMIN_USER.save();
    NORMAL_USER.save();
    NORMAL_USER_2.save();
    TEST_PRODUCT.save();
    NORMAL_CART.save();
    ORDER_1.save();
    ORDER_2.save();

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

    const normal_login_2 = await request(app)
        .post('/api/v2/users/login')
        .send({
            email: NORMAL_USER_2.email,
            password: TEST_PASSWORD,
        })

    NORMAL_TOKEN_2 = normal_login_2.body.token;

});

afterAll(async () => {
    disconnectDB();
    server.close();
})

describe('GET /api/v1/orders/', () => {

    it('NOT OK Anonymous', async () => {
        const res = await request(app)
            .get('/api/v1/orders/')
        expect(res.status).toBe(401);
    });

    it('OK User', async () => {
        const res = await request(app)
            .get('/api/v1/orders/')
            .set('Authorization', `Bearer ${NORMAL_TOKEN}`)
        expect(res.status).toBe(300);
    });

    it('OK Admin', async () => {
        const res = await request(app)
            .get('/api/v1/orders/')
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
        expect(res.status).toBe(300);
    });

});

describe('GET /api/v1/orders/pending', () => {

    it('NOT OK Anonymous', async () => {
        const res = await request(app)
            .get('/api/v2/orders/pending')
        expect(res.status).toBe(401);
    });

    it('OK User', async () => {
        const res = await request(app)
            .get('/api/v2/orders/pending')
            .set('Authorization', `Bearer ${NORMAL_TOKEN}`)
        expect(res.status).toBe(200);
    });

    it('OK Admin', async () => {
        const res = await request(app)
            .get('/api/v2/orders/pending')
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
        expect(res.status).toBe(200);
    });

});

describe('GET /api/v1/orders/completed', () => {

    it('NOT OK Anonymous', async () => {
        const res = await request(app)
            .get('/api/v2/orders/completed')
        expect(res.status).toBe(401);
    });

    it('OK User', async () => {
        const res = await request(app)
            .get('/api/v2/orders/completed')
            .set('Authorization', `Bearer ${NORMAL_TOKEN}`)
        expect(res.status).toBe(200);
    });

    it('OK Admin', async () => {
        const res = await request(app)
            .get('/api/v2/orders/completed')
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
        expect(res.status).toBe(200);
    });

});

describe('POST /api/v2/orders/', () => {

    it('Empty Cart', async () => {
        const res = await request(app)
            .post('/api/v2/orders')
            .set('Authorization', `Bearer ${NORMAL_TOKEN_2}`)
            .send({
                spedizioneCasa : "false"
            })
        expect(res.status).toBe(403);
    });

    it('Missing parameters', async () => {
        const res = await request(app)
            .post('/api/v2/orders')
            .set('Authorization', `Bearer ${NORMAL_TOKEN}`)
        expect(res.status).toBe(400);
    });

    it('Missing address', async () => {
        const res = await request(app)
            .post('/api/v2/orders')
            .set('Authorization', `Bearer ${NORMAL_TOKEN}`)
            .send({
                spedizioneCasa : "true",
            })
        expect(res.status).toBe(400);
    });

    it('Missing address field ', async () => {
        const res = await request(app)
            .post('/api/v2/orders')
            .set('Authorization', `Bearer ${NORMAL_TOKEN}`)
            .send({
                spedizioneCasa : "true",
                indirizzo : {via : "Via Roma 31"}
            })
        expect(res.status).toBe(400);
    });

    it('OK', async () => {
        const res = await request(app)
            .post('/api/v2/orders')
            .set('Authorization', `Bearer ${NORMAL_TOKEN}`)
            .send({
                spedizioneCasa : "false"
            })
        expect(res.status).toBe(201);
    });

    it('Not OK Anonymous', async () => {
        const res = await request(app)
            .post('/api/v2/orders/')
            .send({
                spedizioneCasa : "false"
            })
        expect(res.status).toBe(401);
    });

});

describe('PATCH /api/v2/orders/approve/:id', () => {

    it('Unauthorized regular user', async () => {
        const res = await request(app)
            .patch(`/api/v2/orders/approve/${ORDER_1._id}`)
            .set('Authorization', `Bearer ${NORMAL_TOKEN}`)
        expect(res.status).toBe(401);
    });

    it('Unauthorized anonymous user', async () => {
        const res = await request(app)
            .patch(`/api/v2/orders/approve/${ORDER_1._id}`)
        expect(res.status).toBe(401);
    });

    it('Invalid ID', async () => {
        const res = await request(app)
            .patch(`/api/v2/orders/approve/invalid-id`)
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
        expect(res.status).toBe(400);
    });

    it('Unknown ID', async () => {
        const res = await request(app)
            .patch(`/api/v2/orders/approve/987654321098765432101234`)
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
        expect(res.status).toBe(404);
    });

    it('Missing ID', async () => {
        const res = await request(app)
            .patch(`/api/v2/orders/approve/`)
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
        expect(res.status).toBe(404);
    });

    it('OK', async () => {
        const res = await request(app)
            .patch(`/api/v2/orders/approve/${ORDER_1._id}`)
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
        expect(res.status).toBe(200);
    });

    it('Already approved', async () => {
        const res = await request(app)
            .patch(`/api/v2/orders/approve/${ORDER_1._id}`)
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
        expect(res.status).toBe(403);
    });

});

describe('PATCH /api/v2/orders/not_approve/:id', () => {

    it('Unauthorized regular user', async () => {
        const res = await request(app)
            .patch(`/api/v2/orders/not_approve/${ORDER_2._id}`)
            .set('Authorization', `Bearer ${NORMAL_TOKEN}`)
        expect(res.status).toBe(401);
    });

    it('Unauthorized anonymous user', async () => {
        const res = await request(app)
            .patch(`/api/v2/orders/not_approve/${ORDER_2._id}`)
        expect(res.status).toBe(401);
    });

    it('Invalid ID', async () => {
        const res = await request(app)
            .patch(`/api/v2/orders/not_approve/invalid-id`)
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
        expect(res.status).toBe(400);
    });

    it('Unknown ID', async () => {
        const res = await request(app)
            .patch(`/api/v2/orders/not_approve/987654321098765432101234`)
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
        expect(res.status).toBe(404);
    });

    it('Missing ID', async () => {
        const res = await request(app)
            .patch(`/api/v2/orders/not_approve/`)
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
        expect(res.status).toBe(404);
    });

    it('OK', async () => {
        const res = await request(app)
            .patch(`/api/v2/orders/not_approve/${ORDER_2._id}`)
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
        expect(res.status).toBe(200);
    });

    it('Already disapproved', async () => {
        const res = await request(app)
            .patch(`/api/v2/orders/not_approve/${ORDER_2._id}`)
            .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
        expect(res.status).toBe(403);
    });

});
