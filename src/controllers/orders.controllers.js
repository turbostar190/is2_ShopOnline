const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Order = require("../models/orders");
const Cart = require("../models/cart");

// function to post orders
function postOrders(req, res, next) {

    Cart.find({
        userId: req.user.userId
    })
        .populate('productId')
        .exec()
        .then((cart_items) => {
            if (cart_items.length > 0) {
                let session = null;
                return Order.startSession()
                    .then(_session => {
                        session = _session;
                        session.startTransaction();
                    })
                    .then(() => { 
                        let products = [];
                        cart_items.forEach(element => {
                            products.push({
                                productId: element.productId._id,
                                productName: element.productId.name,
                                quantity: element.quantity,
                                cost: element.productId.cost,
                                totalCost: element.productId.cost * element.quantity
                            });
                        });
                        
                        let order_data = {
                            _id: new mongoose.Types.ObjectId(),
                            products: products,
                            userId: req.user.userId,
                            userName: req.user.nome,
                            accepted: null,
                        }
                        if (req.body.indirizzo) {
                            order_data.indirizzo = req.body.indirizzo;
                        }

                        const order = new Order(order_data);
                        order.save({ session: session });
                    })
                    .then(() => Cart.deleteMany({ userId: req.user.userId }).session(session))
                    .then(() => session.commitTransaction())
                    .then(() => {
                        res.status(201).location("/api/v2/orders/pending").json({}).end();
                    })
                    .then(() => session.endSession())
                    .catch((err) => {
                        session.abortTransaction();
                        session.endSession();
                        console.log(err);
                        res.status(500).json({
                            error: err,
                        });
                    });
            } else {
                return res.status(403).json({
                    message: "Cart is empty, forbidden",
                });
            }
        })
}

function getOrders(req, res, next) {
    return res.status(300).json({
        urls: [
            "/api/v2/orders/getPendingOrders",
            "/api/v2/orders/getCompletedOrders",
        ]
    }).end();
}

function getPendingOrders(req, res, next) {
    let admin = req.user.admin;
    if (admin) {
        Order.find({
            accepted: null
        })
            .exec()
            .then((orders) => {
                res.status(200).json(orders);
            })
            .catch((err) => {
                console.log(err)
                res.status(500).json({
                    message: err.toString()
                })
            });
    } else {
        Order.find({
            userId: req.user.userId
        })
            .exec()
            .then((orders) => {
                res.status(200).json(orders);
            })
            .catch((err) => {
                console.log(err)
                res.status(500).json({
                    message: err.toString()
                })
            });
    }

}


function getCompletedOrders(req, res, next) {
    let admin = req.user.admin;
    if (admin) {
        Order.find({
            accepted: true
        })
            .exec()
            .then((orders) => {
                res.status(200).json(orders);
            })
            .catch((err) => {
                console.log(err)
                res.status(500).json({
                    message: err.toString()
                })
            });
    } else {
        Order.find({
            userId: req.user.userId
        })
            .exec()
            .then((orders) => {
                res.status(200).json(orders);
            })
            .catch((err) => {
                console.log(err)
                res.status(500).json({
                    message: err.toString()
                })
            });
    }

}

function approveOrder(req, res, next) {

    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            message: "Invalid ProductID."
        });
    }
    if (!req.user.admin) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    Order.findById(req.params.id)
        .exec()
        .then((order) => {
            if (order != null) {
                if (order.accepted != null) {
                    return res.status(403).json({
                        message: "Can't change status of already approved order",
                    });
                }

                order.accepted = true;
                order
                    .save()
                    .then((result) => {
                        res.status(200).json(result);
                    })
                    .catch((err) => {
                        console.log(err)
                        res.status(500).json({
                            message: err.toString()
                        })
                    });
            } else {
                return res.status(404).json({
                    message: "Order not found",
                });
            }
        })
        .catch((err) => {
            console.log(err)
            res.status(500).json({
                message: err.toString()
            })
        });
}

function notApproveOrder(req, res, next) {

    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            message: "Invalid ProductID."
        });
    }
    if (!req.user.admin) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    Order.findById(req.params.id)
        .exec()
        .then((order) => {
            if (order != null) {
                if (order.accepted != null) {
                    return res.status(403).json({
                        message: "Can't change status of already approved order",
                    });
                }

                order.accepted = false;
                order
                    .save()
                    .then((result) => {
                        res.status(200).json(result);
                    })
                    .catch((err) => {
                        console.log(err)
                        res.status(500).json({
                            message: err.toString()
                        })
                    });
            } else {
                return res.status(404).json({
                    message: "Order not found",
                });
            }
        })
        .catch((err) => {
            console.log(err)
            res.status(500).json({
                message: err.toString()
            })
        });
}


module.exports = {
    postOrders,
    getOrders,
    approveOrder,
    notApproveOrder,
    getPendingOrders,
    getCompletedOrders
}