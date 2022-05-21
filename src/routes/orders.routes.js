const express = require('express');
const ordersControllers = require('../controllers/orders.controllers.js');
const checkAuth = require('../middleware/checkAuth.middleware')
const router = express.Router();

router.post('/', checkAuth, ordersControllers.postOrders);
router.put('/:id', checkAuth, ordersControllers.approveOrder);
router.get('/', checkAuth, ordersControllers.getOrders);
module.exports = router;