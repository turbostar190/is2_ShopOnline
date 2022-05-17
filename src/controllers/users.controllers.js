const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/users");

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
            console.log(req.body.password,user.password);
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
                            name: user.name,
                        },
                        process.env.jwtSecret, {
                            expiresIn: "1d",
                        }
                    );
                    console.log(result,user)
                    return res.status(200).json({
                        message: "Auth successful",
                        userDetails: {
                            userId: user._id,
                            name: user.name,
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

module.exports = {
    userLogin,
    getMe,
};