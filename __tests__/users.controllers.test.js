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
const { NORMAL_USER, TEST_PASSWORD } = require('../src/mock');

beforeAll(() => {
    jest.setTimeout(10000);
    connectDB();
    NORMAL_USER.save();
})

afterAll(async () => {
    disconnectDB();
    server.close();
})

test('app module should be defined', () => {
    expect(app).toBeDefined();
});

describe('POST /api/v1/users/signin', () => {
    it('User already registered', async () => {
        expect.assertions(1);
        const response = await request(app).post('/api/v1/users/signin').send({
            email: NORMAL_USER.email,
            password: TEST_PASSWORD,
            nome: NORMAL_USER.nome,
        });
        expect(response.statusCode).toBe(403);
    });

    it('Missing Parameters', async () => {
        expect.assertions(1);
        const response = await request(app).post('/api/v1/users/signin')
            .send({
                'email': NORMAL_USER.email,
                'password': TEST_PASSWORD,
            });
        expect(response.statusCode).toBe(400);
    });
});

describe('POST /api/v1/users/login', () => {
    expect.assertions(1);
    it('No Credentials', async () => {
        const response = await request(app).post('/api/v1/users/login');
        expect(response.statusCode).toBe(401);
    });

    it('Wrong Password', async () => {
        expect.assertions(1);
        const response = await request(app).post('/api/v1/users/login').expect('Content-Type', /json/)
            .send({
                'email': NORMAL_USER.email,
                'password': `wrong-${TEST_PASSWORD}`,
            });
        expect(response.statusCode).toBe(401);
    });

    it('OK', async () => {
        expect.assertions(1);
        const response = await request(app).post('/api/v1/users/login').expect('Content-Type', /json/)
            .send({
                'email': NORMAL_USER.email,
                'password': TEST_PASSWORD,
            });
        expect(response.statusCode).toBe(200);
    });
});