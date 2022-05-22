const express = require('express');
const checkAuth = require('../middleware/checkAuth.middleware');
const cartControllers = require('../controllers/cart.controllers');
const router = express.Router();

router.get('/', checkAuth, cartControllers.getCart);
router.get('/quantity', checkAuth, cartControllers.getCartTotalQuantity);
router.post('/', checkAuth, cartControllers.addElementToCart);
router.patch('/:id', checkAuth, cartControllers.updateElementFromCart);
router.delete('/:id', checkAuth, cartControllers.deleteElementFromCart);

module.exports = router