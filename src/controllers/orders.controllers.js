const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Order = require("../models/orders");
const Cart = require("../models/cart");

// function to post orders
function postOrders(req, res, next) {
    console.log("init orders");
    
    Cart.find({
        userId: req.user.userId
    })
        .populate('productId')
        .exec()
        .then((cart) => {
            console.log(cart);
            if (cart.length > 0) {
                let products = [];
                let set = new Set();
                cart.forEach(element => {
                    if (set.has(element.productId._id)) {
                        let index = products.findIndex(p => p.productId == element.productId._id);
                        products[index].quantity += element.quantity;
                    } else {
                        set.add(element.productId._id);
                        products.push({
                            productId: element.productId._id,
                            productName: element.productId.name,
                            quantity: element.quantity
                        });
                    }
                });
                _id = new mongoose.Types.ObjectId();
                let order_data = {
                    _id: _id,
                    products: products,
                    userId: req.user.userId,
                    userName: req.user.nome,
                    timestamp: _id.getTimestamp(),
                    accepted: null,
                }
                console.log(req.user.nome);
                const order = new Order(order_data);

                order
                    .save()
                    .then(async (result) => {
                        result
                            .save()
                            .then((result1) => {
                                console.log(`Order created ${result}`)
                                res.status(201).location("/api/orders/" + result._id).json({}).end();
                            })
                            .catch((err) => {
                                console.log(err)
                                res.status(500).json({
                                    message: err.toString()
                                })
                            });
                    })
                    .catch((err) => {
                        console.log(err)
                        res.status(500).json({
                            message: err.toString()
                        })
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
    console.log("init get");
    console.log(req.user);
    let admin = req.user.admin;
    if (admin) {
        Order.find({
            accepted:null
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
    console.log("init get");
    console.log(req.user);
    let admin = req.user.admin;
    if (admin) {
        Order.find({
            accepted:true
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
    console.log("init approve");

    if (req.user.admin) {
        Order.findById(req.params.id)
            .exec()
            .then((order) => {
                if (order != null) {
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
    }else{
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

}

function notApproveOrder(req, res, next) {
    console.log("init approve");

    if(req.user.admin){
        Order.findById(req.params.id)
        .exec()
        .then((order) => {
            if (order != null) {
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
    }else{
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

}


module.exports = {
    postOrders,
    getOrders,
    approveOrder,
    notApproveOrder,
    getPendingOrders,
    getCompletedOrders
}