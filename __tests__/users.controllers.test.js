// Tests
// https://mongoosejs.com/docs/jest.html#timer-mocks
const time = require('../src/time');
const sinon = require('sinon');
sinon.stub(time, 'setTimeout');

/**
 * https://www.npmjs.com/package/supertest
 */
const request = require('supertest');
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const { app, server } = require('../index');

const { connectDB, disconnectDB } = require('../database');
const mongoose = require('mongoose');

const bcrypt = require("bcrypt");
const User = require("../src/models/users");

const email_test = "test@test.test"
const pw_test = "new-password"
const name_test = "Test User"

beforeAll(() => {
    jest.setTimeout(10000);
    connectDB();

    const user = new User({
        _id: new mongoose.Types.ObjectId(),
        email: "test@test.test",
        password: bcrypt.hashSync("new-password", 10),
        nome: "Test User",
        indirizzo: null,

    });

    user.save();
})

afterAll(async () => {
    disconnectDB();
    server.close();
})

test('app module should be defined', () => {
    expect(app).toBeDefined();
});

describe('POST /api/v1/users/signin', () => {
    it('POST /api/v1/users/signin of already registered user should return 403', async () => {
        expect.assertions(1);
        const response = await request(app).post('/api/v1/users/signin').send({
            email: email_test,
            password: pw_test,
            nome: name_test,
        });
        expect(response.statusCode).toBe(403);
    });

    it('POST /api/v1/users/signin with missing fields should return 400', async () => {
        expect.assertions(1);
        const response = await request(app).post('/api/v1/users/signin')
            .send({
                'email': email_test,
                'password': pw_test
            });
        expect(response.statusCode).toBe(400);
    });
});

describe('POST /api/v1/users/login', () => {
    expect.assertions(1);
    it('POST /api/v1/users/login with no credentials should return 401', async () => {
        const response = await request(app).post('/api/v1/users/login');
        expect(response.statusCode).toBe(401);
    });

    it('POST /api/v1/users/login with invalid password should return 401', async () => {
        expect.assertions(1);
        const response = await request(app).post('/api/v1/users/login').expect('Content-Type', /json/)
            .send({
                'email': email_test,
                'password': `wrong-${pw_test}`
            });
        expect(response.statusCode).toBe(401);
    });

    it('POST /api/v1/users/login with correct credentials should return 200', async () => {
        expect.assertions(1);
        const response = await request(app).post('/api/v1/users/login').expect('Content-Type', /json/)
            .send({
                'email': email_test,
                'password': pw_test
            });
        expect(response.statusCode).toBe(200);
    });
});