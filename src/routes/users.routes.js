const express = require('express');
const checkAuth = require('../middleware/checkAuth.middleware');
const userControllers = require('../controllers/users.controllers');
const router = express.Router();

router.post('/login', userControllers.userLogin);
router.get('/me', checkAuth, userControllers.getMe);

module.exports = router