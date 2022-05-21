const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/users");
const mongoose = require('mongoose');

const userLogin = (req, res, next) => {
    User.findOne({
        email: req.body.email
    })
        .exec()
        .then((user) => {
            console.log(user)
            if (user == null) {
                return res.status(401).json({
                    message: "Auth failed: Email not found",
                });
            }
            console.log(req.body.password, user.password);
            bcrypt.compare(req.body.password, user.password, (err, result) => {
                if (err) {
                    console.log(err)
                    return res.status(401).json({
                        message: "Auth failed, the password is wrong",
                    });
                }
                if (result) {
                    const token = jwt.sign({
                        userId: user._id,
                        email: user.email,
                        nome: user.nome,
                        admin: user.admin != undefined
                    },
                        process.env.jwtSecret, {
                        expiresIn: "1d",
                    }
                    );
                    console.log(result, user)
                    return res.status(200).json({
                        message: "Auth successful",
                        userDetails: {
                            userId: user._id,
                            nome: user.nome,
                            email: user.email,
                        },
                        token: token,
                    });
                }
                res.status(401).json({
                    message: "Auth failed!",
                });
            });
        })
        .catch((err) => {
            res.status(500).json({
                error: err,
            });
        });
}

const getMe = async (req, res) => {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (user) {
        res.status(200).json({
            message: "Found",
            user,
        });
    } else {
        res.status(400).json({
            message: "Bad request",
        });
    }
};

// Se arriva qui è perché ha passato i controlli e quindi rimanda indietro se stesso
const checkToken = async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    console.log(req.user);
    res.status(200).json({
        message: {
            token: token,
            nome: req.user.nome,
            admin: req.user.admin,
            _id : req.user.userId
        },
    });
}

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
                        const user_data = {
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash,
                            nome: req.body.nome,
                            indirizzo: null
                        };
                        if (req.body.indirizzo != null) {
                            user_data['indirizzo'] = req.body.indirizzo;
                        }
                        const user = new User(user_data);
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
                                                nome: result.nome,
                                                indirizzo: result.indirizzo || {}
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
    userLogin,
    getMe,
    checkToken
};