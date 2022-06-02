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
var productId;
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

describe('POST /products', () => { 
    it('created a products successfully', async () => {
        //TODO: random name
        const response = await request(app)
            .post('/api/v1/products')
            .set('Content-Type', 'form-data')
            .set('Authorization', `Bearer ${token}`)
            .field('name', 'product2') 
            .field('description', 'product') 
            .field('cost', 10) 
            .field('category', 'product') 
            .attach('img', './__tests__/test_image.png') 
            .expect(201).then(res => {
                productId = res.body.product._id;
                });
    }
    );
    it('Unsuccessfully created a product for missing parameters', async () => {
        //TODO: random name
        const response = await request(app)
            .post('/api/v1/products')
            .set('Content-Type', 'form-data')
            .set('Authorization', `Bearer ${token}`)
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
            .set('Authorization', `Bearer ${token}`)
            .set('Content-Type', 'form-data')
            .field('name', 'product2') 
            .field('description', 'product') 
            .field('cost', 10) 
            .field('category', 'product') 
            .attach('img', './__tests__/test_image.png') 
            .expect(403);
    }
    );
    it('Unsuccessfully created a products for invalid parameter', async () => {

        const response = await request(app)
            .post('/api/v1/products')
            .set('Content-Type', 'form-data')
            .set('Authorization', `Bearer ${token}`)
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
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
    }
    );
}
);

describe('GET /products/:id', () => {
    it('successfully get product by id', async () => {
        const response = await request(app)
            .get('/api/v1/products/'+productId)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
    }
    );
    it('unsuccessfully get product by id', async () => {
        const response = await request(app)
            .get('/api/v1/products/zzzzzzzzzzzzzzzzzzzzzz')
            .set('Authorization', `Bearer ${token}`)
            .expect(404);
    }
    );
}
);

describe('PATCH /products/:id', () => {
    it('successfully edited product by id', async () => {

        const response = await request(app)
            .patch('/api/v1/products/'+productId)
            .set('Content-Type', 'form-data')
            .set('Authorization', `Bearer ${token}`)
            .field('name', 'product2') 
            .field('description', 'product') 
            .field('cost', 10) 
            .field('category', 'product') 
            .attach('img', './__tests__/test_image.png') 
            .expect(200);
    }
    );
    it('unsuccessfully edited product by id, negative cost', async () => {
        const response = await request(app)
            .patch('/api/v1/products/zzzzzzzzzzzzzzzzzzzzzz')
            .set('Content-Type', 'form-data')
            .set('Authorization', `Bearer ${token}`)
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
            .patch('/api/v1/products/'+productId)
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
            .set('Authorization', `Bearer ${token}`)
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
            .set('Authorization', `Bearer ${token}`)
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
            .delete('/api/v1/products/'+productId)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
    }
    );
}
);