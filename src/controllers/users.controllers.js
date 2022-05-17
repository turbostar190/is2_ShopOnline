const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/users");
const mongoose = require('mongoose');

const userSignIn = (req, res, next) => {
    User.find({
            email: req.body.email
        })
        .exec()
        .then((user) => {
            if (user.length >= 1) {
                res.status(409).json({
                    message: "Email Exists"
                })
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err,
                        });
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash,
                            name: req.body.name,
                        });
                        user
                            .save()
                            .then(async (result) => {
                                await result
                                    .save()
                                    .then((result1) => {
                                        console.log(`User created ${result}`)
                                        res.status(201).json({
                                            userDetails: {
                                                userId: result._id,
                                                email: result.email,
                                                name: result.name,
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
                    }
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
    userSignIn,
};