const mongoose = require('mongoose');
const Artifact = require('../models/artifact');
const User = require('../models/user');

var  showIndex = function(req,res) {
    var results = {title: 'Inherit', error: " "};
    res.render('index', results);
};

module.exports = {
    showIndex
};

var Login = function (req,res) {
    res.render('login.pug', {title: 'Login'});
};

var Signup = function (req,res) {
    res.render('signup.pug', {title: 'Signup'});
};

module.exports.fetchLogin = Login;
module.exports.fetchSignup = Signup;