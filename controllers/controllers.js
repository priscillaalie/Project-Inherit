const mongoose = require('mongoose');
const Artifact = require('../models/artifact');
const User = require('../models/user');
const Group = require('../models/familygroups');
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
    res.render('profile.pug', {title: 'Profile'});
};

var fetchIntro = function(req,res) {
    res.render('getstarted.pug',{title: 'Get Started'})
};

var fetchHomepage = function(req, res) {
	if (req.cookies.sessionId) {
		User.findOne({sessionId: req.cookies.sessionId},function(err,user){
            if (!err) {
            	Group.find({'_id': {$in: user.groups}}, function(err, familygroups) {
            		if (!err) {
		             	var results = {
		             		title: 'Inherit', 'familygroups': familygroups, 
		             		'session':req.cookies.sessionId, 'name': user.fname
		             	};
		             	res.render('homepage.pug', results);
	             } else {
	             	res.sendStatus(500);
	             }
             	});
            } else {
            	res.sendStatus(500);
            }
        });
	} else {
		var results = {title:'Inherit'};
		res.render('homepage.pug', results);
	}
};

var fetchSettings = function(req, res) {
    var sid = req.cookies.sessionId;
    User.findOne({sessionId: sid}, function(err, user){
        if (!err){
            var results = {title: 'Inherit', session: sid, user: user};
            res.render('settings.pug', results);
        }
    });
};

var fetchDeleteAccount = function(req, res) {
    var results = {title: 'Inherit', session: req.cookies.sessionId, error: ''};
    res.render('deleteAccount.pug', results)
}

var fetchPrivacy = function(req, res) {
    var results = {title: 'Inherit', session: req.cookies.sessionId};
    res.render('privacy.pug', results);
};

var editUser = function(req, res){
    User.findOne({sessionId:req.cookies.sessionId}, function(err, user) {
        if (!err && user) {
            user.fname = req.body.fname;
            user.lname = req.body.lname;
            user.email = req.body.email;
            user.photo = req.body.b64;
            user.phone = req.body.phone;

            user.save(function(err, updatedUser) {
                if (updatedUser) {
                    let message = "Your account has been updated.";
                    let results = {title: 'Inherit', error: message,
                        user: updatedUser, session: req.cookies.sessionId};
                    res.render('settings', results);
                } else {
                    res.sendStatus(500);
                }
            });
        } else {
            res.cookie('sessionId', '');
            res.redirect('/login')
        }
    });
};

var editPassword = function(req, res){
    var sid = req.cookies.sessionId
    User.findOne({sessionId: sid}, function(err, user) {
        if (req.body.password.length < 8) {
            let message = "Your password must be at least 8 characters.";
            let results = {title: 'Inherit', error: message, session: sid}
            res.render('privacy.pug', results);
        }
        else if (!err && user) {
            bcrypt.hash(req.body.password, saltRounds, function(hasherr, hash) {
                user.password = hash;
                user.save(function(err, updatedUser) {
                    if (updatedUser) {
                        let message = "Your account has been updated.";
                        let results = {title: 'Inherit', error: message,
                            session: sid}
                        res.render('privacy.pug', results);
                    } else {
                        res.sendStatus(500);
                    }
                });
            });
        } else {
            res.cookie('sessionId', '');
            res.redirect('/login')
        }
    });
};

var deleteUser = function(req, res){
    var sid = req.cookies.sessionId;
    var username = req.body.username;
    var pw = req.body.password;

    User.find({email: username}, function(err, user){
        if(!err){
            if (user.length != 1) {
                var message = "Wrong credentials. Please try again.";
                var results = {title: 'Inherit', error: message, session: sid}
                res.render('deleteAccount.pug', results);
            } else {
                bcrypt.compare(pw, user[0].password, function (err, same){
                    if (same) {
                        user[0].listings.forEach(function(element){
                            Listing.findById(element, function(err, listing){
                                listing.remove();
                            });
                        });
                        user[0].remove();
                        res.redirect('/logout');
                    } else {
                        var message = "Wrong credentials. Please try again.";
                        var results = {title: 'Inherit', error: message,
                            session: sid}
                        res.render('deleteAccount.pug', results);
                    }
                });
            }
        }else{
            // Redirect back to login with server error bubble
            res.sendStatus(500);
        }
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
                        res.render('signup.pug', results);
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

var checkUser = function(req, res) {
    password = req.body.password
    User.find({'email': req.body.email},function(err,user){
        if(!err){
            if (user.length != 1) {
                var message = "Incorrect email or password. Please try again.";
                var results = {title: 'Inherit', error: message}
                res.render('login.pug', results);
            } else {
                bcrypt.compare(password, user[0].password, function (err, same){
                    if (same) {
                        let sidrequest = utils.generate_unique_sid();
                        sidrequest.then(function (sid) {
                            user[0].sessionId = sid;
                            user[0].save();
                            res.cookie("sessionId", sid).redirect("/home");
                        });
                    } else {
                        var message = "Incorrect email or password. Please try again.";
                        var results = {title: 'Inherit', error: message}
                        res.render('login.pug', results);
                    }
                });
            }
        }else{
            // Redirect back to login with server error bubble
            res.sendStatus(500);
        }
    });
};

var fetchAntiquesByUser = function(req, res) {
    if (req.cookies.sessionId) {
    	User.findOne({sessionId: req.cookies.sessionId}, function(err,user) {
    		if (!err) {
    			Group.find({$or:[{'members':user._id}, {'owner':user._id}]}, function(err, familygroups) {
    				if (!err) {
    					Artifact.find({'_id': {$in: user.artifacts}}, function(err, artifacts) {
    						if (!err) {
    							console.log(artifacts);
	    						var results = {
	                                title: 'Inherit', 'artifacts': artifacts, 'user': user._id,
	                                session: req.cookies.sessionId, 'familygroups': familygroups
	                            };
	                            res.render('myantiques.pug', results);
	                        } else {
	                        	res.sendStatus(500);
	                        }
    					})
    				} else {
    					res.sendStatus(500);
    				}
            		
              	});
    		} else {
    			res.sendStatus(500);
    		}
    	})
    }
};


var createAntique = function(req,res){

	var sid = req.cookies.sessionId;
	// Get current date and time
    var today = new Date();

	User.findOne({sessionId: sid}, function(err,user) {
		if (!err) {
			var antique = new Artifact({
		        "title": req.body.title,
		        "description": req.body.description,
		        "familygroup": req.body.familygroup,
		        "photo": req.body.b64,
		        "owner": user._id
		    });
		    antique.created = today;
		    antique.save(function(err, newAntique) {
		    	if (!err) {
		    		user.artifacts.push(antique._id);
		    		user.save();
		    		res.redirect('/myantiques');
		    	} else {
		    		res.sendStatus(400);
		    	}
		    })
		}
	});
};

// Connect to the db
const dbURI =
    "mongodb+srv://priscilla:A9qiVFZSiqjFhfgm@cluster0-guonz.mongodb.net/test?retryWrites=true";


module.exports = {
    showIndex,
    fetchLogin,
    fetchSignup,
    fetchProfile,
    fetchIntro,
    fetchHomepage,
    fetchSettings,
    checkUser,
    createUser,
    editUser,
    editPassword,
    deleteUser,
    fetchDeleteAccount,
    fetchPrivacy,
    fetchAntiquesByUser,
    createAntique
}

