const Products = require("../models/products");
const Cart = require("../models/cart");
const Users = require("../models/users");

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

//function to get the cart of the user
function getCart(req, res, next) {
    console.log("init get");

    const userId = req.user.userId;
    Cart.find({
        userId: userId
    })
        .populate('productId')
        .exec()
        .then(docs => {
            res.status(200).json(
                docs.map(doc => {
                    return {
                        _id: doc._id,
                        productId: doc.productId,
                        userId: doc.userId,
                        quantity: doc.quantity,
                    }
                })
            );
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
}
//function to add an element to the cart
function addElementToCart(req, res, next) {

    const userId = req.user.userId;

    console.log("init add");
    if (!(req.body.productId && userId)) {
        return res.status(400).json({
            message: "Missing parameters"
        });
    }
    const cart = new Cart({
        _id: mongoose.Types.ObjectId(),
        productId: req.body.productId,
        userId: userId,
        quantity: req.body.quantity
    });
    cart.save()
        .then(result => {
            res.status(201).json({
                message: 'Element added to cart',
                createdCart: {
                    _id: result._id,
                    productId: result.productId,
                    userId: result.userId,
                    quantity: result.quantity,
                },
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/cart/' + result._id
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
}

//function to delete an element from the cart
function deleteElementFromCart(req, res, next) {
    console.log("init delete");
    Cart.findOne({
        _id: req.params.id
    })
        .exec()
        .then((element) => {
            if (element == null) {
                return res.status(404).json({
                    message: "Cart element not found"
                });
            }
            Cart.deleteOne({
                _id: req.params.id
            })
                .exec()
                .then(result => {
                    res.status(200).json({
                        message: 'Element deleted from cart',
                    });
                }).catch(err => {
                    res.status(500).json({
                        error: err
                    });
                });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
}

module.exports = {
    getCart,
    addElementToCart,
    deleteElementFromCart
}