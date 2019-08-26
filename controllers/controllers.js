const mongoose = require('mongoose');
const Artifact = require('../models/artifact');
const User = require('../models/user');

var  showIndex = function(req,res) {
    var results = {title: 'Inherit', error: " "};
    res.render('index', results);
};


var fetchLogin = function (req,res) {
    res.render('login.pug', {title: 'Login'});
};

var fetchSignup = function (req,res) {
    res.render('signup.pug', {title: 'Signup'});
};

var fetchProfile = function (req,res) {
    res.render('profile.pug', {title: 'Signup'});
};


module.exports = {
    showIndex,
    fetchLogin,
    fetchSignup,
    fetchProfile
}
