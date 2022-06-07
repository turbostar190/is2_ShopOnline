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

    if (!req.body.name || !req.body.description || !req.body.category || !req.body.cost || !req.file) {
        res.status(400).json({
            message: "Missing product parameters"
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
                        res.status(201).location("/api/v2/products/" + result._id).json({}).end();
                    })
                    .catch((err) => {
                        console.log(err)
                        res.status(500).json({
                            message: err.toString()
                        })
                    });
            } else {
                res.status(403).json({
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

    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400).json({
            message: "Invalid ID"
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
            } else {
                res.status(404).json({
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
    let dict = {}
    let dictSort = {updatedAt: -1 }
    if (req.query.sort == "name") {
        dictSort = { 'name': 'asc', updatedAt: -1 }
    } else if (req.query.sort == "cost") {
        dictSort = { 'cost': 'asc', updatedAt: -1  }
    }

    if (req.query.category) {
        dict['category'] = req.query.category
    }
    if (req.query.search) {
        dict['name'] = { '$regex': '^' + req.query.search, '$options': 'i' }
    }

    const products = Product
        .find(dict)
        .collation({'locale': 'it'})
        .sort(dictSort)
        .exec()
        .then(function (products) {
            res.status(200).json(
                products,
            );
        })
        .catch(function (err) {
            console.log(err);
            res.status(500).json({
                err: err
            });
        });

};

const getProductById = async (req, res) => {

    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            message: "Invalid ID"
        });
    }

    Product
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
            console.log(err);
            res.status(500).json({
                err: err
            });
        });
};

const getCategories = async (req, res) => {
    Product
        .find({})
        .collation({'locale': 'it'})
        .sort({ category: 'asc' })
        .exec()
        .then(function (products) {
            if (products) {
                let set = new Set();
                products.map(product => {
                    set.add(product.category)
                })
                res.status(200).json(
                    Array.from(set),
                );
            }
        })
        .catch(function (err) {
            console.log(err);
            res.status(500).json({
                err: err
            });
        });
};

const deleteProductById = async (req, res) => {
    if (!req.user.admin) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            message: "Invalid ID"
        });
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
    deleteProductById,
    getCategories
};