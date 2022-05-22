const express = require('express');
const checkAuth = require('../middleware/checkAuth.middleware');
const userControllers = require('../controllers/users.controllers');
const router = express.Router();

/**
 * @openapi
 * /v1/users/checkToken:
 *   get:
 *     description: Welcome to swagger-jsdoc!
 *     produces:
 *       - application/json
 *     security:
 *       - token: []
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 */
router.get('/checkToken', checkAuth, userControllers.checkToken);

/**
 * @openapi
 * /v1/users/login:
 *   post:
 *     description: Welcome to swagger-jsdoc!
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 */
router.post('/login', userControllers.userLogin);

/**
 * @openapi
 * /v1/users/me:
 *   get:
 *     description: Welcome to swagger-jsdoc!
 *     security:
 *       - token: []
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 */
router.get('/me', checkAuth, userControllers.getMe);

/**
 * @openapi
 * /v1/users/signin:
 *   post:
 *     description: Welcome to swagger-jsdoc!
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 */
router.post('/signin', userControllers.userSignIn);

module.exports = router