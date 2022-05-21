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
            if (cart != null) {
                
                let products = [];
                cart.forEach(element => {   
                    products.push({
                        productId: element.productId._id,
                        quantity: element.quantity
                    });
                    console.log(element);
                });
                console.log(products);
                let order_data = {
                    _id: new mongoose.Types.ObjectId(),
                    products: products,
                    userId: req.user.userId
                }
                const order = new Order(order_data);

                order
                    .save()
                    .then(async (result) => {
                        result
                            .save()
                            .then((result1) => {
                                console.log(`Order created ${result}`)
                                res.status(201).location("/api/orders/" + result._id).end();
                            })
                            .catch((err) => {
                                console.log(err)
                                res.status(400).json({
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
                return res.status(500).json({
                    message: "Cart is empty",
                });
            }
        })
}

function getOrders(req, res, next){
    console.log("init get");
    console.log(req.user);
    let admin = req.user.admin;
    if(admin){
        Order.find()
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
    }else{
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
module.exports = {
    postOrders,
    getOrders
}