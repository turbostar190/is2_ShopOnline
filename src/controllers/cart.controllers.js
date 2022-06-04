const Products = require("../models/products");
const Cart = require("../models/cart");
const Users = require("../models/users");

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

/**
 * Ottiene il carrello dell'utente
 */
function getCart(req, res, next) {

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
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

/**
 * Ottiene il numero totale di prodotti nel carrello dell'utente
 */
function getCartTotalQuantity(req, res, next) {

    let userId = mongoose.Types.ObjectId(req.user.userId) // fix always empty array result
    Cart
        .aggregate([{
                $match: {
                    userId: userId
                }
            },
            {
                $group: {
                    _id: null,
                    quantityTot: {
                        $sum: "$quantity"
                    },
                    count: {
                        $sum: 1
                    }
                }
            }
        ])
        .exec()
        .then(docs => {
            res.status(200).json(
                docs.length > 0 ? docs[0] : {}
            );
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

/**
 * Aggiunge un elemento al carrello dell'utente
 */
function addElementToCart(req, res, next) {

    const userId = req.user.userId;;
    if (!(req.body.productId && userId)) {
        return res.status(400).json({
            message: "Missing parameters"
        });
    }

    if (req.body.quantity <= 0) {
        res.status(400).json({
            message: "Quantity must be greater than 0",
        });
        return;
    }
    if (!req.body.productId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            message: "Invalid ProductID."
        });
    }

    Products.findOne({
            _id: req.body.productId
        }).exec()
        .then(function (doc) {
            if (doc == null) {
                res.status(404).json({
                    message: "Product not found"
                });
            } else {
                Cart.findOne({
                        userId: userId,
                        productId: req.body.productId
                    })
                    .exec()
                    .then(function (doc) {
                        if (doc == null) {
                            const cart = new Cart({
                                _id: mongoose.Types.ObjectId(),
                                productId: req.body.productId,
                                userId: userId,
                                quantity: req.body.quantity
                            });
                            cart.save()
                                .then(result => {
                                    // TODO: Per ora non si può ottenere solo uno specifico prodotto dal carrello... 
                                    // ritorna quindi location per intero carrello
                                    res.status(201).location("/api/v1/cart/").json({}).end();
                                })
                                .catch(err => {
                                    console.log("errore cart save add", err.toString());
                                    res.status(500).json({
                                        error: "errore cart save add"
                                    });
                                });
                        } else {
                            // update
                            doc.quantity += 1;
                            doc
                                .save()
                                .then((result1) => {
                                    res.status(200).json({
                                        message: 'Quantity changed',
                                    });
                                })
                                .catch((err) => {
                                    console.log(err)
                                    res.status(500).json({
                                        message: err.toString()
                                    })
                                });
                        }
                    });
            }
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });


}

/**
 * Modifica la quantità di un elemento del carrello dell'utente
 */
function updateElementFromCart(req, res, next) {

    const userId = req.user.userId;

    if (!req.body.productId || !req.body.quantity) {
        return res.status(400).json({
            message: "Missing parameters"
        });
    }

    if (!req.body.productId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            message: "Invalid ProductID"
        });
    }

    Products.findOne({
            _id: req.body.productId
        }).exec()
        .then(function (doc) {
            if (doc == null) {
                res.status(404).json({
                    message: "Product not found"
                });
            } else {
                Cart.findOne({
                        userId: userId,
                        productId: req.body.productId
                    })
                    .exec()
                    .then(function (doc) {
                        if (doc == null) {
                            res.status(404).json({
                                error: "Cart element not found"
                            });
                        } else {
                            // update
                            doc.quantity = req.body.quantity;
                            doc
                                .save()
                                .then((result1) => {
                                    res.status(200).json({
                                        message: 'Quantity changed',
                                        doc: doc
                                    });
                                })
                                .catch((err) => {
                                    console.log(err)
                                    res.status(500).json({
                                        message: err.toString()
                                    })
                                });
                        }
                    });
            }
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

/**
 * Rimuove un elemento dal carrello dell'utente
 */
function deleteElementFromCart(req, res, next) {

    const userId = req.user.userId;

    if (!req.body.productId) {
        return res.status(400).json({
            message: "Missing parameters"
        });
    }

    if (!req.body.productId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            message: "The id is not valid"
        });
    }

    Products.findOne({
            _id: req.body.productId
        }).exec()
        .then(function (doc) {
            if (doc == null) {
                res.status(404).json({
                    message: "Product not found"
                });
            } else {
                Cart.findOne({
                        productId: req.body.productId,
                        userId: userId
                    })
                    .exec()
                    .then((element) => {
                        if (element == null) {
                            return res.status(404).json({
                                message: "Cart element not found"
                            });
                        }
                        Cart.deleteOne({
                                _id: element._id
                            })
                            .exec()
                            .then(result => {
                                res.status(200).json({
                                    message: 'Element deleted from cart',
                                });
                            }).catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    error: err
                                });
                            });
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        });
                    });
            }
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

module.exports = {
    getCart,
    getCartTotalQuantity,
    addElementToCart,
    updateElementFromCart,
    deleteElementFromCart,
}