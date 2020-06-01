const { validationResult } = require('express-validator');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty) {
        const error = new Error("Validation Error for signup!");
        error.statusCode = 422;
        error.data = error.array();
        throw error;
    }

    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    bcrypt
        .hash(password, 12)
        .then(hashedPw => {
            const user = new User({
                email: email,
                password: hashedPw,
                name: name
            });
            return user.save();     
        })
        .then(savedUser => {
            console.log(savedUser);
            res.status(201).json({message: "New user created!", userId: savedUser._id});
        })
        .catch(error => {
            if(!error.statusCode) {
                error.statudCode = 500;
            }
            next(error);
        });
};

exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    User.findOne({ email: email})
        .then(user => {
            if(!user) {
                const error = new Error("User does not exist");
                error.statusCode = 401;
                throw error;
            }
            loadedUser = user;
            return bcrypt.compare(password, user.password);
        })
        .then(isMatch => {
            if(!isMatch) {
                const error = new Error("Wrong password!");
                error.statusCode = 401;
                throw error;
            }
            const token = jwt.sign(
                {
                    email: loadedUser.email,
                    userId: loadedUser._id.toString(),
                },
                'secret',
                {expiresIn: '1h'}
            );
            res.status(200).json({token: token, userId: loadedUser._id.toString()});
        })
        .catch(error => {
            if(!error.statusCode) {
                error.statudCode = 500;
            }
            next(error);
        })
}