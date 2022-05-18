const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Product = require("../models/products");
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const postProducts = (req, res, next) => {
    console.log("Init post");
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
                    cost : req.body.cost,
                    img: {
                        data: fs.readFileSync(path.resolve('./uploads/' + req.file.filename)),
                        contentType: 'image/png'
                    }
                }
                const product = new Product(product_data);

                product
                    .save()
                    .then(async (result) => {
                        await result
                            .save()
                            .then((result1) => {
                                console.log(`Product created ${result}`)
                                res.status(201).json({
                                    productDetails: {
                                        productId: result._id,
                                        name: result.name,
                                        description: result.description,
                                        category: result.category,
                                        cost : result.cost,
                                    },
                                })
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
            }else{
                return res.status(401).json({
                    message: "Product with the same name exists",
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
    const products = await Product.find();
    if (products) {
        res.status(200).json({
            products,
        });
    } else {
        res.status(400).json({
            message: "Bad request",
        });
    }
};

module.exports = {
    postProducts,
    getProducts,
};