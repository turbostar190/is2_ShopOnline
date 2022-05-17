const express = require('express');
const userControllers = require('../controllers/users.controllers');
const router = express.Router();

router.post('/signin', userControllers.userSignIn);

module.exports = router