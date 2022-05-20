const bcrypt = require("bcrypt");
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
};