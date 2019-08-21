const mongoose = require('mongoose');
const Artifact = require('../models/artifact');
const User = require('../models/user');
var express = require('express');
var app = express();

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

var AddUser = function (req,res) {
	var data = new User(req.body);
	data.save()
		.then(item => {
			res.send("User added to database!");
			console.log(req.body);
		})
		.catch(err => {
			res.status(400).send("Unable to add to database");
			console.log(err);
		});
}

module.exports.fetchLogin = Login;
module.exports.fetchSignup = Signup;
module.exports.addUser = AddUser;