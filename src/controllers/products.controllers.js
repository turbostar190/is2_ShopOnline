const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Product = require("../models/products");
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const editProducts = (req, res, next) => {
    if (req.body.cost < 0) {
        res.status(400).json({
            message: "Cost must be positive",
        });
        fs.unlinkSync(path.resolve('./uploads/' + req.file.filename))
        return;
    }

    console.log("Init edit");
    Product.findOne({
            _id: req.params.id
        })
        .exec()
        .then((product) => {
            if (product != null) {
                    product.name = req.body.name,
                    product.description = req.body.description,
                    product.category =  req.body.category,
                    product.cost = req.body.cost,
                    product.img = {
                        data: fs.readFileSync(path.resolve('./uploads/' + req.file.filename)),
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


module.exports = {
    editProducts,
};