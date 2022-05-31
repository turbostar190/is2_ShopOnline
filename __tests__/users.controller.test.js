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
const app = require('../index');

beforeAll(() => {
    jest.setTimeout(10000);
})

afterAll(async () => {
})

test('app module should be defined', () => {
    expect(app).toBeDefined();
});

describe('POST /api/v1/users/signin', () => {
    it('POST /api/v1/users/signin of already registered user should return 403', async () => {
        expect.assertions(1);
        const response = await request(app).post('/api/v1/users/signin').send({
            email: 'federicoc.2000@gmail.com',
            password: 'new-password',
            nome: 'Test User',
        });
        expect(response.statusCode).toBe(403);
    });

    it('POST /api/v1/users/signin with missing fields should return 400', async () => {
        expect.assertions(1);
        const response = await request(app).post('/api/v1/users/signin')
            .send({
                'email': "new-mail@is2.unitn.it",
                'password': "password"
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
                'email': "federicoc.2000@gmail.com",
                'password': "wrongpassword"
            });
        expect(response.statusCode).toBe(401);
    });

    it('POST /api/v1/users/login with correct credentials should return 200', async () => {
        expect.assertions(1);
        const response = await request(app).post('/api/v1/users/login').expect('Content-Type', /json/)
            .send({
                'email': "federicoc.2000@gmail.com",
                'password': "f"
            });
        expect(response.statusCode).toBe(200);
    });
});

    // create a valid token
    //    var payload = {
    //      email: 'John@mail.com'
    //    }
    //    var options = {
    //      expiresIn: 86400 // expires in 24 hours
    //    }
    //    var token = jwt.sign(payload, process.env.SUPER_SECRET, options);

    //    test('GET /api/v1/students/me?token=<valid> should return 200', async () => {
    //      expect.assertions(1);
    //      const response = await request(app).get('/api/v1/students/me?token='+token);
    //      expect(response.statusCode).toBe(200);
    //    });

    //    test('GET /api/v1/students/me?token=<valid> should return user information', async () => {
    //      expect.assertions(2);
    //      const response = await request(app).get('/api/v1/students/me?token='+token);
    //      const user = response.body;
    //      expect(user).toBeDefined();
    //      expect(user.email).toBe('John@mail.com');
    //    });