const mongoose = require('mongoose');
const Artifact = require('../models/artifact');
const User = require('../models/user');
const Group = require('../models/familygroups');
const utils = require('./utils.js');
var express = require('express');
var nodemailer = require("nodemailer");
var app = express();

const bcrypt = require('bcrypt');
const saltRounds = 10;

//renders the index page
var  showIndex = function(req,res) {
    var results = {title: 'Inherit', error: " "};
    res.render('index', results);
};

var fetchSend = function (req, res) {
    res.render('send.pug', {title: 'Send'});
}

//sends the new user a verification email and takes them to their profile page
var getStarted = function(req,res) {
    send(req, res);
    fetchSend(req,res);
}


// renders the login page
var fetchLogin = function (req,res) {
    res.render('login.pug', {title: 'Login'});
};

// renders the signup page
var fetchSignup = function (req,res) {
    res.render('signup.pug', {title: 'Signup'});
};

// renders the profile page
var fetchProfile = function (req,res) {
    res.render('profile.pug', {title: 'Profile'});
};

// if it is a current user, find the user's information such as name and groups they are in 
// and send this to the front end to be displayed. if not, display basic front end
var fetchHomepage = function(req, res) {
	if (req.cookies.sessionId) {
		User.findOne({sessionId: req.cookies.sessionId},function(err,user){
            if (user) {
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

// displays the settings page of a user
var fetchSettings = function(req, res) {
    var sid = req.cookies.sessionId;
    User.findOne({sessionId: sid}, function(err, user){
        if (!err){
            var results = {title: 'Inherit', session: sid, user: user};
            res.render('settings.pug', results);
        }
    });
};

// renders the delete account page
var fetchDeleteAccount = function(req, res) {
    var results = {title: 'Inherit', session: req.cookies.sessionId, error: ''};
    res.render('deleteAccount.pug', results)
}

// renders the privacy page
var fetchPrivacy = function(req, res) {
    var results = {title: 'Inherit', session: req.cookies.sessionId};
    res.render('privacy.pug', results);
};

// changes the data of a user
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

// changes the password of a user
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

// deletes a user
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

// creates a user and adds all their information to the database
// also sends the user a verification 
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
                    }
                    else{
                        user.save(function(err,newUser){
                            if(!err){
                                //if there are no errors, show the new user

                                getStarted(req,res);

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

// checks a user's entered credentials
var checkUser = function(req, res) {
    password = req.body.password
    User.findOne({'email': req.body.email},function(err,user){
        if(!err){
            // user cannot be found
            if (!user) {
                var message = "Incorrect email or password. Please try again.";
                var results = {title: 'Inherit', error: message}
                res.render('login.pug', results);
            } else {
                // encrypt password and compare encrypted data against stored encrypted password
                bcrypt.compare(password, user.password, function (err, same){
                    if (same) {
                        let sidrequest = utils.generate_unique_sid();
                        sidrequest.then(function (sid) {
                            user.sessionId = sid;
                            user.markModified('sessionId');
                            user.save();
                            res.cookie("sessionId", sid);
                            Group.find({'_id': {$in: user.groups}}, function(err, familygroups) {
                                if (!err) {
                                    var results = {
                                        title: 'Inherit', 'familygroups': familygroups,
                                        'session': sid, 'name': user.fname
                                    };
                                    res.render('homepage.pug', results);
                                } else {
                                    res.sendStatus(500);
                                }
                            })
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

// renders the myantiques page by passing in data about user's antiques and families
var fetchAntiquesByUser = function(req, res) {
    if (req.cookies.sessionId) {
    	User.findOne({sessionId: req.cookies.sessionId}, function(err,user) {
    		if (!err) {
    			Group.find({'_id':{$in: user.groups}}, function(err, familygroups) {
    				if (!err) {
    					Artifact.find({'_id': {$in: user.artifacts}}, function(err, artifacts) {
    						if (!err) {
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

// adds an antique to the database
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
                    Group.findById(req.body.familygroup, function(err, group) {
                        group.artifacts.push(antique._id);
                        group.save();
                    });
		    		user.save();
		    		res.redirect('/myantiques');
		    	} else {
		    		res.sendStatus(400);
		    	}
		    })
		}
	});
};

// declaring login authorisation for the organisation email 
var smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "projectinherit28@gmail.com",
        pass: "iwant2commit"
    }
})

var rand, mailOptions, host, link;

// sends the user an email link to verify
var send = function(req,res) {
    rand=Math.floor((Math.random() * 100) + 54);
    host=req.get('host');
    link="http://"+req.get('host')+"/verify?id="+rand;
    mailOptions={
        to : req.body.email,
        subject : "Please confirm your email account",
        html : "Hello,<br> Please click on the link to verify your email.<br><a href="+link+">Click here to verify</a>" 
    }
    console.log(mailOptions);
    smtpTransport.sendMail(mailOptions, function(error, response){
    if(error){
        console.log(error);
    }
});
};

// verifies a user and changes their data in database to verified
var verify = function(req, res) {
    console.log(req.protocol+":/"+req.get('host'));
    if((req.protocol+"://"+req.get('host'))==("http://"+host))
    {
        if(req.query.id==rand)
        {

            console.log("email is verified");
            res.render('verify.pug');

            // change verified to true
            User.findOne({'email':mailOptions.to}, function (error, person) {
                if (error) console.log(error);
                console.log(mailOptions.to);
                person.verified = true;
                person.save();
            })
        }
        else
        {
            console.log("email is not verified");
            res.end("<h1>Bad Request</h1>");
        }
    }
    else
    {
        res.end("<h1>Request is from unknown source");
    };
};

var showArtifactByID = function(req, res) {
    var ID = req.params.id;
    Artifact.findById(ID, function(err, artifact) {
        if(!err){
            res.render('artifact.pug', {artifact: artifact});
        }else{
            res.sendStatus(404);
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
    getStarted,
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
    createAntique,
    send,
    verify,
    showArtifactByID
}

