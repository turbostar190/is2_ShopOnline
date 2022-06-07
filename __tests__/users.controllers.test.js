// Tests
// https://mongoosejs.com/docs/jest.html#timer-mocks
const time = require('../src/time');
const sinon = require('sinon');
sinon.stub(time, 'setTimeout');

// https://www.npmjs.com/package/supertest
const request = require('supertest');
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const { app, server } = require('../index');

const { connectDB, disconnectDB } = require('../src/database');
const { ADMIN_USER, NORMAL_USER, NORMAL_USER_2, TEST_PASSWORD, EXPIRED_TOKEN } = require('../src/mock');

var NORMAL_TOKEN;
var ADMIN_TOKEN;

beforeAll(async () => {

    jest.setTimeout(10000);
    connectDB();

    NORMAL_USER.save();
    ADMIN_USER.save();

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
})

afterAll(async () => {
    disconnectDB();
    server.close();
})

test('app module should be defined', () => {
    expect(app).toBeDefined();
});

describe('POST /api/v2/users/signin', () => {
    it('User already registered', async () => {
        expect.assertions(1);
        const response = await request(app).post('/api/v2/users/signin').send({
            email: NORMAL_USER.email,
            password: TEST_PASSWORD,
            nome: NORMAL_USER.nome,
        });
        expect(response.statusCode).toBe(403);
    });

    it('Missing Parameters', async () => {
        expect.assertions(1);
        const response = await request(app).post('/api/v2/users/signin')
            .send({
                'email': NORMAL_USER.email,
                'password': TEST_PASSWORD,
            });
        expect(response.statusCode).toBe(400);
    });

    it('Short password', async () => {
        const response = await request(app).post('/api/v2/users/signin').expect('Content-Type', /json/)
            .send({
                'email': `unknown${NORMAL_USER.email}`,
                'password': '12345',
            }).expect(400);
    });
    
    it('OK', async () => {
        expect.assertions(1);
        const response = await request(app).post('/api/v2/users/signin').send({
            email: NORMAL_USER_2.email,
            password: TEST_PASSWORD,
            nome: NORMAL_USER_2.nome,
        });
        expect(response.statusCode).toBe(201);
    });
});

describe('POST /api/v2/users/login', () => {
    expect.assertions(1);
    it('No Credentials', async () => {
        const response = await request(app).post('/api/v2/users/login');
        expect(response.statusCode).toBe(400);
    });

    it('Missing parameters', async () => {
        expect.assertions(1);
        const response = await request(app).post('/api/v2/users/login').expect('Content-Type', /json/)
            .send({
                'email': NORMAL_USER.email
            });
        expect(response.statusCode).toBe(400);
    });

    it('Wrong Password', async () => {
        expect.assertions(1);
        const response = await request(app).post('/api/v2/users/login').expect('Content-Type', /json/)
            .send({
                'email': NORMAL_USER.email,
                'password': `wrong-${TEST_PASSWORD}`,
            });
        expect(response.statusCode).toBe(401);
    });

    it('Unknown email', async () => {
        expect.assertions(1);
        const response = await request(app).post('/api/v2/users/login').expect('Content-Type', /json/)
            .send({
                'email': `unknown${NORMAL_USER.email}`,
                'password': TEST_PASSWORD,
            });
        expect(response.statusCode).toBe(401);
    });

    it('OK', async () => {
        expect.assertions(1);
        const response = await request(app).post('/api/v2/users/login').expect('Content-Type', /json/)
            .send({
                'email': NORMAL_USER.email,
                'password': TEST_PASSWORD,
            });
        expect(response.statusCode).toBe(200);
    });
});

describe('GET /api/v2/users/me', () => {
    it('OK', async () => {
        const response = await request(app).get('/api/v2/users/me')
        .set('Authorization', `Bearer ${NORMAL_TOKEN}`).expect(200);
    });
    it('Invalid Token', async () => {
        const response = await request(app).get('/api/v2/users/me')
        .set('Authorization', `Bearer zzzzzzzzzz`).expect(401);
    });
    it('Wrong Token', async () => {
        const response = await request(app).get('/api/v2/users/me')
        .set('Authorization', `Bearer ${EXPIRED_TOKEN}`).expect(401);
    });
});

describe('GET /api/v2/users/checkToken', () => {
    it('OK', async () => {
        const response = await request(app).get('/api/v2/users/checkToken')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`).expect(200);
    });
    it('Invalid Token', async () => {
        const response = await request(app).get('/api/v2/users/checkToken')
        .set('Authorization', `Bearer zzzzzzzzzz`).expect(401);
    });
    it('Wrong Token', async () => {
        const response = await request(app).get('/api/v2/users/checkToken')
        .set('Authorization', `Bearer ${EXPIRED_TOKEN}`).expect(401);
    });
});