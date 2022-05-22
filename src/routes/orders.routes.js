const express = require('express');
const ordersControllers = require('../controllers/orders.controllers.js');
const checkAuth = require('../middleware/checkAuth.middleware')
const router = express.Router();

router.post('/', checkAuth, ordersControllers.postOrders);
router.put('/approve/:id', checkAuth, ordersControllers.approveOrder);
router.put('/not_approve/:id', checkAuth, ordersControllers.notApproveOrder);
router.get('/', checkAuth, ordersControllers.getOrders);
module.exports = router;