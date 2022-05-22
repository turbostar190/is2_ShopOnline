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

/**
 * Ottiene il numero totale di prodotti nel carrello dell'utente
 */
function getCartTotalQuantity(req, res, next) {
    console.log("total");

    let userId = mongoose.Types.ObjectId(req.user.userId) // fix always empty array result
    Cart
        .aggregate([
            { $match: { userId: userId } },
            { $group: { _id: null, quantityTot: { $sum: "$quantity" }, count: { $sum: 1 } } }
        ])
        .exec()
        .then(docs => {
            console.log(docs);
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
    console.log("init add");

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

    Cart.findOne({
        userId: userId,
        productId: req.body.productId
    })
        .exec()
        .then(function (doc) {
            if (doc == null) {
                console.log("new")
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
                        res.status(201).location("/api/v1/cart/").end();
                    })
                    .catch(err => {
                        console.log("errore cart save add", err.toString());
                        res.status(500).json({
                            error: "errore cart save add"
                        });
                    });
            } else {
                // update
                console.log("update");
                doc.quantity += 1;
                doc
                    .save()
                    .then((result1) => {
                        console.log(`Modificata quantità carrello`)
                        res.status(200).json({
                            message: 'Quantity changed',
                        });
                    })
                    .catch((err) => {
                        console.log(err)
                        res.status(400).json({
                            message: err.toString()
                        })
                    });
            }
        });
}

/**
 * Modifica la quantità di un elemento del carrello dell'utente
 */
function updateElementFromCart(req, res, next) {
    console.log("update");

    const userId = req.user.userId;;
    if (!req.body.productId || !req.body.quantity || !req.params.id) {
        return res.status(400).json({
            message: "Missing parameters"
        });
    }

    Cart.findOne({
        _id: req.params.id,
        userId: userId,
        productId: req.body.productId
    })
        .exec()
        .then(function (doc) {
            if (doc == null) {
                console.log("no cart item to modify", err.toString());
                res.status(400).json({
                    error: "no cart item to modify"
                });
            } else {
                // update
                console.log("updating quantity");
                doc.quantity = req.body.quantity;

                doc
                    .save()
                    .then((result1) => {
                        console.log(`Modificata quantità carrello`)
                        res.status(200).json({
                            message: 'Quantity changed',
                            doc: doc
                        });
                    })
                    .catch((err) => {
                        console.log(err)
                        res.status(400).json({
                            message: err.toString()
                        })
                    });
            }
        });
}

/**
 * Rimuove un elemento dal carrello dell'utente
 */
function deleteElementFromCart(req, res, next) {
    console.log("init delete");

    const userId = req.user.userId;;
    if (!req.params.id) {
        return res.status(400).json({
            message: "Missing parameters"
        });
    }
    
    Cart.findOne({
        _id: req.params.id,
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
    getCartTotalQuantity,
    addElementToCart,
    updateElementFromCart,
    deleteElementFromCart,
}