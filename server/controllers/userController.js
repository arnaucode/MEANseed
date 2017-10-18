//File: controllers/userController.js
var mongoose = require('mongoose');
var userModel = mongoose.model('userModel');

var config = require('../config');
var pageSize = config.pageSize;

/* */
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var express = require("express");
var app = express();
var config = require('../config'); // get our config file
app.set('superSecret', config.secret); // secret variable

var crypto = require('crypto');
/* */

var request = require('request');

function getRand(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}

function getAvatar(n) {
    switch (n) {
        case 1:
            avatar = "img/avatars/racoon.png";
            break;
        case 2:
            avatar = "img/avatars/duck.png";
            break;
        case 3:
            avatar = "img/avatars/clown-fish.png";
            break;
        case 4:
            avatar = "img/avatars/tiger.png";
            break;
        case 5:
            avatar = "img/avatars/sloth.png";
            break;
        case 6:
            avatar = "img/avatars/penguin.png";
            break;
        case 7:
            avatar = "img/avatars/owl.png";
            break;
        case 8:
            avatar = "img/avatars/chameleon.png";
            break;
        case 9:
            avatar = "img/avatars/siberian-husky.png";
            break;
        case 10:
            avatar = "img/avatars/toucan.png";
            break;
        default:
            avatar = "img/avatars/racoon.png";
    }
    return avatar;
}

//POST - Insert a new User in the DB
exports.signup = function(req, res) {
    //get random avatar
    var r = getRand(1, 10);
    randAvatar = getAvatar(r);


    var user = new userModel({
        username: req.body.username,
        password: crypto.createHash('sha256').update(req.body.password).digest('base64'),
        description: req.body.description,
        avatar: randAvatar,
        email: req.body.email,
        phone: req.body.phone
    });
    if (user.username == undefined) {
        return res.status(500).jsonp("empty inputs");
    } else if (user.password == undefined) {
        return res.status(500).jsonp("empty inputs");
    } else if (user.email == undefined) {
        return res.status(500).jsonp("empty inputs");
    }

    user.save(function(err, user) {
        if (err) return res.send(500, err.message);

        exports.login(req, res);
    });
};


//POST - auth user
exports.login = function(req, res) {
    // find the user
    userModel.findOne({
            username: req.body.username
        })
        .select('+password')
        .exec(function(err, user) {

            if (err) throw err;

            if (!user) {
                res.json({
                    success: false,
                    message: 'Authentication failed. User not found.'
                });
            } else if (user) {

                req.body.password = crypto.createHash('sha256').update(req.body.password).digest('base64');

                // check if password matches
                if (user.password != req.body.password) {
                    res.json({
                        success: false,
                        message: 'Authentication failed. Wrong password.'
                    });
                } else {

                    // if user is found and password is right
                    // create a token
                    var token = jwt.sign({
                        foo: 'bar'
                    }, app.get('superSecret'), {
                        //expiresInMinutes: 1440 // expires in 24 hours
                        //expiresIn: '60m'
                    });
                    user.token = token;
                    user.save(function(err, user) {
                        if (err) return res.send(500, err.message);
                        //res.status(200).jsonp(travel);
                        console.log(user);
                        // return the information including token as JSON
                        user.password = "";
                        res.json({
                            success: true,
                            message: 'Enjoy your token!',
                            token: token,
                            user: user
                        });
                    });

                }

            }

        });
};

//GET - Return all Users in the DB
exports.getAllUsers = function(req, res) {
    userModel.find()
        .limit(pageSize)
        .skip(pageSize * Number(req.query.page))
        .exec(function(err, users) {
            if (err) return res.send(500, err.message);
            res.status(200).jsonp(users);
        });
};

exports.getUserById = function(req, res) {
    userModel.findOne({
            _id: req.params.userid
        })
        .lean()
        .populate('validatedBy', 'username')
        .populate('travels', 'title from to date type')
        .exec(function(err, user) {
            if (err) return res.send(500, err.message);
            if (!user) {
                res.json({
                    success: false,
                    message: 'User not found.'
                });
            } else if (user) {
                res.status(200).jsonp(user);
            }
        });
};
exports.getUserByToken = function(req, res) {
    userModel.findOne({
            'token': req.headers['x-access-token']
        })
        .lean()
        .populate('travels', 'title from to date')
        .exec(function(err, user) {
            if (err) return res.send(500, err.message);
            if (!user) {
                res.json({
                    success: false,
                    message: 'User not found.'
                });
            } else if (user) {

                res.status(200).jsonp(user);
            }
        });
};


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}


function updateUserWithNewImages(req, res, imgUrl) {
    //adding random number to the url, to force ionic reload the image
    req.body.avatar = imgUrl + "?" + getRandomInt(1, 9999);
    userModel.update({
            'token': req.headers['x-access-token']
        }, req.body,
        function(err) {
            if (err) return console.log(err);
            exports.getUserByToken(req, res);
        });
}
exports.updateUser = function(req, res) {
    updateUserWithNewImages(req, res, req.body.avatar);
};

//DELETE - Delete a user with specified ID
exports.deleteUser = function(req, res) {
    userModel.findOne({
            'token': req.headers['x-access-token']
        })
        .exec(function(err, user) {
            user.remove(function(err) {
                if (err) return res.send(500, err.message);
                res.status(200).jsonp("deleted");
            })
        });
};
