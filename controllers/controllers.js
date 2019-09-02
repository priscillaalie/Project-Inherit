const mongoose = require('mongoose');
const Artifact = require('../models/artifact');
const User = require('../models/user');
const utils = require('./utils.js');
var express = require('express');
var app = express();

const bcrypt = require('bcrypt');
const saltRounds = 10;


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

var fetchIntro = function(req,res) {
    res.render('getstarted.pug',{title: 'Get Started'})
};

var addUser = function (req,res) {
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

var createUser = function(req,res){
    if (req.body.password.length < 8){
        var message = "Password must be more than 7 characters";
        var results = {title: 'Inherit', error: message,
            email: req.body.email, fname: req.body.fname, phone: req.body.phone,
            lname: req.body.lname, birthday: req.body.birthday};
        res.render('signup', results);
    } else {
        bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
            var user = new User({
                "email":req.body.email,
                "fname":req.body.fname,
                "lname":req.body.lname,
                "birthday":req.body.birthday,
                "photo":req.body.photo,
                "phone":req.body.phone,
                "password":hash
            });
            // Check if the email already exists
            User.find({email: req.body.email}, function(err, users){
                if (!err){
                    if(users.length != 0){
                        var message = "Email address already in use. Please log in.";
                        var results = {title: 'Inherit', error: message,
                            email: req.body.email, fname: req.body.fname,
                            lname: req.body.lname, phone: req.body.phone};
                        res.render('signup', results);
                    }
                    else{
                        user.save(function(err,newUser){
                            if(!err){
                                //if there are no errors, show the new user
                                fetchIntro(req,res)
                                console.log("user added to database");
                            }else{
                                res.sendStatus(400);
                            }
                        });
                    }
                }
                else {
                    res.sendStatus(400);
                }
            });
        });
    }
};

var checkUser = function(req,res) {
    // check if user exists
    User.countDocuments({'email': req.body.email}, function (err, count){ 
    if(count>0){
        //let hash = bcrypt.hash(req.body.password, saltRounds);
        User.findOne({'email':req.body.email}, function (error, person) {
            if (err) console.log(err);
            if (bcrypt.compareSync(person.password, req.body.password)) {
                res.send("Incorrect Password");
            } else {
                fetchProfile(req, res);
            }
        });
    } else {
        console.log("user does not exist");
    }
}); 
}

// Connect to the db
const dbURI =
    "mongodb+srv://priscilla:A9qiVFZSiqjFhfgm@cluster0-guonz.mongodb.net/test?retryWrites=true";


module.exports = {
    showIndex,
    fetchLogin,
    fetchSignup,
    fetchProfile,
    fetchIntro,
    addUser,
    checkUser,
    createUser
}

