const Product = require("../models/products");
const Cart = require("../models/cart");
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const postProducts = (req, res, next) => {
    if (!req.user.admin) {
        res.status(401).json({
            message: "Unauthorized"
        });
        return;
    }

    if (req.body.cost < 0) {
        res.status(400).json({
            message: "Cost must be positive",
        });
        fs.unlinkSync(path.resolve('./uploads/' + req.file.filename))
        return;
    }

    Product.findOne({
        name: req.body.name
    })
        .exec()
        .then((product) => {
            if (product == null) {
                let product_data = {
                    _id: new mongoose.Types.ObjectId(),
                    name: req.body.name,
                    description: req.body.description,
                    category: req.body.category,
                    cost: req.body.cost,
                    img: {
                        data: fs.readFileSync(path.resolve('./uploads/' + req.file.filename)).toString('base64'),
                        contentType: 'image/png'
                    }
                }
                const product = new Product(product_data);

                product
                    .save()
                    .then(async (result) => {
                        result
                            .save()
                            .then((result1) => {
                                console.log(`Product created ${result}`)
                                res.status(201).location("/api/products/" + result._id).json({}).end();
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
                    message: "Product already exists",
                });
            }
            fs.unlinkSync(path.resolve('./uploads/' + req.file.filename))
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                error: err,
            });
        });
}

const editProducts = (req, res, next) => {
    if (!req.user.admin) {
        res.status(401).json({
            message: "Unauthorized"
        });
        return;
    }

    if (req.body.cost < 0) {
        res.status(400).json({
            message: "Cost must be positive",
        });
        fs.unlinkSync(path.resolve('./uploads/' + req.file.filename))
        return;
    }

    Product.findOne({
        _id: req.params.id
    })
        .exec()
        .then((product) => {
            if (product != null) {
                product.name = req.body.name,
                    product.description = req.body.description,
                    product.category = req.body.category,
                    product.cost = req.body.cost,
                    product.img = {
                        data: fs.readFileSync(path.resolve('./uploads/' + req.file.filename)).toString('base64'),
                        contentType: 'image/png'
                    }
                product
                    .save()
                    .then(async (result) => {
                        await result
                            .save()
                            .then((result1) => {
                                console.log(`Product edited ${result}`)
                                res.status(200).json({
                                    productDetails: {
                                        productId: result._id,
                                        name: result.name,
                                        description: result.description,
                                        category: result.category,
                                        cost: result.cost,
                                    },
                                })
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
                return res.status(404).json({
                    message: "Product don't exist",
                });
            }
            fs.unlinkSync(path.resolve('./uploads/' + req.file.filename))
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                error: err,
            });
        });
}

const getProducts = async (req, res) => {
    console.log("find");
    const products = Product
        .find({})
        .then(function (products) {
            res.status(200).json(
                products,
            );
        })
        .catch(function (err) {
            res.status(500).json({
                err: err
            });
        });

};

const getProductById = async (req, res) => {
    const product = Product
        .findOne({ _id: req.params.id })
        .then(function (product) {
            if (product) {
                res.status(200).json(
                    product,
                );
            } else {
                res.status(404).json({
                    message: "Not found",
                });
            }
        })
        .catch(function (err) {
            res.status(500).json({
                err: err
            });
        });

};

const deleteProductById = async (req, res) => {
    if (!req.user.admin) {
        res.status(401).json({
            message: "Unauthorized"
        });
        return;
    }

    let session = null;
    return Product.startSession()
        .then(_session => {
            session = _session;
            session.startTransaction();
        })
        .then(() => Cart.deleteMany({ productId: req.params.id }).session(session))
        .then(() => Product.deleteOne({ _id: req.params.id }).session(session))
        .then(() => session.commitTransaction())
        .then(() => session.endSession())
        .then(() => {
            // idempotente
            console.log(`Product deleted from products and carts`)
            res.status(204).end()
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                error: err,
            });
        });
};

module.exports = {
    postProducts,
    getProducts,
    editProducts,
    getProductById,
    deleteProductById
};