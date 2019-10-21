/*
controllers.js contains functions that are for the basic functions of the web application
this includes:
- rendering pug into html
- checking session id's to determine which layout is shown
- editing user data
- editing password for account
- deleting user
- creating user
- logging in users
- creating artifacts
- fetching artifacts that user has access to
- sending verification email after sign up
- verifying user account
- searching existing users to add to family group
 */
const mongoose = require('mongoose');
const Artifact = require('../models/artifact');
const User = require('../models/user');
const Group = require('../models/familygroups');
const utils = require('./utils.js');
const Comment = require('../models/comment');
var express = require('express');
var nodemailer = require("nodemailer");
var app = express();

const bcrypt = require('bcryptjs');
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

var fetchPost = function(req,res) {
    res.render('familypost.pug');

};

// if it is a current user, find the user's information such as name and groups they are in
// and send this to the front end to be displayed. if not, display basic front end
var fetchHomepage = function(req, res) {
    User.find({}, function(err,users) {
        if (!err) {
	        if (req.cookies.sessionId) {
                User.findOne({sessionId: req.cookies.sessionId}, function (err, user) {
                    if (user) {
                        Group.find({'_id': {$in: user.groups}}, function (err, familygroups) {
                            if (!err) {
                                var results = {
                                    title: 'Inherit', 'familygroups': familygroups,
                                    'session': req.cookies.sessionId, 'name': user.fname, 'users':users
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
                var results = {title: 'Inherit'};
                res.render('homepage.pug', results);
            }
        }
    });
}


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
    singleUpload(req, res, function(err) {
        User.findOne({sessionId:req.cookies.sessionId}, function(err, user) {
            if (!err && user) {
                user.fname = req.body.fname;
                user.lname = req.body.lname;
                user.email = req.body.email;
                user.phone = req.body.phone;
                user.name = req.body.fname + ' ' + req.body.lname;
                if (req.file) {
                    user.photo = req.file.location;
                }
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
    })
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
        singleUpload(req, res, function(err) {
            bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
                var user = new User({
                    "email":req.body.email,
                    "fname":req.body.fname,
                    "lname":req.body.lname,
                    "birthday":req.body.birthday,
                    "phone":req.body.phone,
                    "password":hash,
                    "name": req.body.fname + ' ' + req.body.lname
                });
                // Check if the email already exists
                User.find({email: req.body.email}, function(err, users){
                    if (!err){
                        if(users.length != 0){
                            var message = "Email address already in use. Please log in.";
                            var results = {title: 'Inherit', error: message,
                                email: req.body.email, fname: req.body.fname,
                                lname: req.body.lname, phone: req.body.phone};
                            res.render('signup',results);
                        }
                        else{
                            user.save(function(err,newUser){
                                if(!err){
                                    //if there are no errors, show the new user
                                    getStarted(req,res);
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
        })
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

// renders the myartifacts page by passing in data about user's artifacts and families
var fetchArtifactsByUser = function(req, res) {
    if (req.cookies.sessionId) {
    	User.findOne({sessionId: req.cookies.sessionId}, function(err,user) {
    		if (!err) {
    			Group.find({'_id':{$in: user.groups}}, function(err, familygroups) {
    				if (!err) {
    					Artifact.find({'_id': {$in: user.artifacts}}, function(err, artifacts) {
    						if (!err) {
	    						var results = {
	                                title: 'Inherit', 'artifacts': artifacts, 'user': user,
	                                session: req.cookies.sessionId, 'familygroups': familygroups
	                            };
	                            res.render('myartifacts.pug', results);
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

var fetchArtifactsById = function(req, res) {
    var memberId = req.url.split('/')[2]
    if (req.cookies.sessionId) {
        User.findOne({sessionId: req.cookies.sessionId}, function(err,user) {
            if (!err) {
                Group.find({'_id':{$in: user.groups}}, function(err, familygroups) {
                    if (!err) {
                        User.findById(memberId, function(err, member) {
                            if (!err) {
                                Artifact.find({'_id': {$in: member.artifacts}}, function(err, artifacts) {
                                    if (!err) {
                                        var results = {
                                            title: 'Inherit', 'artifacts': artifacts, 'user': user,
                                            session: req.cookies.sessionId, 'familygroups': familygroups
                                        };
                                        res.render('profile.pug', results);
                                    } else {
                                        res.sendStatus(500);
                                    }
                                })
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



var upload = require('../services/file-uploader');
var singleUpload = upload.single('image');


var deleteArtifact = function(req, res) {
    var artifactId = req.url.split('/')[2];
    var groupId;
    Artifact.findById(artifactId, function(err, artifact) {
        if (!err) {
            console.log(artifact);
            groupId = artifact.familygroup;
            console.log(groupId);
            //deleting from group
            Group.findById(groupId, function(err, group) {
                if (!err) {
                    var position = group.artifacts.indexOf(artifactId);
                    group.artifacts.splice(position, 1);
                    console.log(group);
                    group.save();
                    // deleting from owner
                    User.findById(artifact.owner, function(err, owner) {
                        if (!err) {
                            var position = owner.artifacts.indexOf(artifactId);
                            owner.artifacts.splice(position, 1);
                            owner.save();
                            Artifact.deleteOne({'_id':artifactId}, function(err, result) {
                                if (!err) {
                                    console.log('artifact deleted');
                                    res.redirect('/view/' + groupId);
                                } else {
                                    console.log(err);
                                    console.log('failed to delete artifact');
                                }
                            })
                        } else {
                            res.sendStatus(500);
                        }
                    })
                } else {
                    res.sendStatus(500);
                }
            })
            //deleting from owner

        } else {
            console.log(err);
            res.sendStatus(404);
        }
    })

}

// adds an artifact to the database
var createArtifact = function(req,res){
    var sid = req.cookies.sessionId;
    // Get current date and time
    var today = new Date();
    singleUpload(req, res, function(err) {
    	User.findOne({sessionId: sid}, function(err,user) {
    		if (!err) {
                var artifact = new Artifact({
                    "title": req.body.title,
                    "description": req.body.description,
                    "owner": user._id
                });
                if (req.file) {
        			artifact.photo = req.file.location;
                }

                var groupId;
                var toGo;
                if (req.body.familygroup) {
                    groupId = req.body.familygroup;
                    toGo = '/myartifacts';
                } else {
                    groupId = req.headers.referer.split('/')[4];
                    toGo = '/view/' + groupId;
                }
                artifact.familygroup = groupId;
                artifact.created = today;
                console.log(artifact);
                artifact.save(function(err, newArtifact) {
                    if (!err) {
                        user.artifacts.push(artifact._id);
                        user.save();
                        if (groupId != "None") {
                            Group.findById(groupId, function(err, group) {
                                if (!err) {
                                    group.artifacts.push(artifact._id);
                                    group.save();
                                } else {
                                    console.log(err);
                                    res.sendStatus(500);
                                }
                            });
                        }
                        res.redirect(toGo);
                    } else {
                        console.log(err);
                        res.sendStatus(500);
                    }
                })
    		} else {
                console.log(err);
                res.sendStatus(500);
            }
    	});
    })
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
    host=req.get('host');
    User.findOne({'email':req.body.email}, function(err, user) {
        if (!err) {
            link="http://" + host + "/verify?id=" + user._id;

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
        } else {
            res.end("User was not found, try creating another account.");
        }
    })


};

// verifies a user and changes their data in database to verified
var verify = function(req, res) {
    // change verified to true
    console.log(req.query);
    User.findById(req.query.id, function(err, person) {
        if (!err) {
            res.render('verify.pug');
            person.verified = true;
            person.save();
        } else {
            console.log("email is not verified");
            res.end("<h1>Bad Request</h1>");
        }
    })
};

var fetchArtifactByID = function(req, res) {
    var ID = req.params.id;
    Artifact.findById(ID, function(err, artifact) {
        if(!err){
            User.findOne({sessionId: req.cookies.sessionId}, function(err, user) {
                if (!err) {
                    Group.find({'_id': {$in: user.groups}}, function (err, familygroups) {
                        if (!err) {
                            Comment.find({'_id':{$in: artifact.comments}}, function(err, comments) {
                                if (!err) {
                                    User.findById(artifact.owner, function(err, owner) {
                                        if (!err) {
                                            if (artifact.familygroup != "None") {
                                                Group.findById(artifact.familygroup, function(err, belongsTo) {
                                                    if (!err) {
                                                        res.render('artifact.pug', {artifact: artifact, familygroups:familygroups,
                                                        comments:comments, session: req.cookies.sessionId, owner:owner.name,
                                                        familyname:belongsTo.title, user:user, title: artifact.title});
                                                    } else {
                                                        console.log(err);
                                                        res.sendStatus(500);
                                                    }
                                                })
                                            } else {
                                                res.render('artifact.pug', {artifact: artifact, familygroups:familygroups,
                                                comments:comments, session: req.cookies.sessionId, owner:owner.name,
                                                familyname:"None", user:user});
                                            }
                                        } else {
                                            console.log(err);
                                            res.sendStatus(500);
                                        }
                                    })
                                } else {
                                    console.log(err);
                                    res.sendStatus(500);
                                }
                            })

                        } else {
                            res.sendStatus(404);
                        }
                    })
                } else {
                    res.sendStatus(404);
                }
            })
        }else{
            res.sendStatus(404);
        }
    });
};

var searchUser = function(req, res) {
    var input = req.params.input;
    var regex = new RegExp(input, 'i');
    User.find({"name": regex}, function(err, users) {
        if(!err){
            for (var i=0; i<users.length; i++) {
                console.log(users[i].name);
            }
            res.json(users);
        }else{
            res.sendStatus(404);
        }
    });
};

var findUserByName = function(req, res) {
    var Name = req.params.name;
    User.find({name:Name}, function(err, user) {
        if(!err){
            res.send(user); //if no errors send the listings found
        }else{
            res.sendStatus(404);
        }
    });
};

var searchResults = function(req, res) {
    console.log(req);
    var input = req.query.input;
    var regex = new RegExp(input, 'i');
    User.find({"name": regex}, function(err, users) {
        var results = {
            title: 'Inherit', "users": users,
            session: req.cookies.sessionId
        };
        if (!err) {
            res.render('members.pug', results);
        } else {
            res.sendStatus(500);
        }
    });
}

var addComment = function(req, res) {
    var artifactId = req.headers.referer.split('/')[5];
    User.findOne({sessionId: req.cookies.sessionId}, function(err, user) {
        Artifact.findById(artifactId, function(err, artifact) {
            var comment = new Comment({
                "owner": user._id,
                "content": req.body.comment,
                "artifact": artifactId,
                "ownername": user.name
            })
            comment.created = Date.now();
            comment.save(function(err, newComment) {
                if (!err) {
                    artifact.comments.push(comment._id);
                    artifact.save();
                    res.redirect('/artifact/view/'+artifactId);
                } else {
                    res.sendStatus(400);
                }
            })
        })
    });
}

var deleteComment = function(req, res) {
    var commentId = req.url.split('/')[2];
    console.log(commentId);
    var artifactId;
    Comment.findById(commentId, function(err, comment) {
        if (!err) {
            artifactId = comment.artifact;
            Artifact.findById(artifactId, function(err, artifact) {
                if (!err) {
                    var position = artifact.comments.indexOf(commentId);
                    artifact.comments.splice(position, 1);
                    console.log(artifact);
                    artifact.save();
                    Comment.deleteOne({'_id': commentId}, function(err, result) {
                        if (!err) {
                            console.log('comment deleted');
                            res.redirect('/artifact/view/' + artifactId);
                        } else {
                            console.log(err);
                            console.log('failed to delete comment');
                        }
                    })
                } else {
                    res.sendStatus(500);
                }
            })
        } else {
            res.sendStatus(404);
        }
    })
}

var editArtifact = function(req, res) {
    singleUpload(req, res, function(err) {
        if (!err) {
            Artifact.findById(req.originalUrl.split('/')[3], function(err, artifact) {
                if (!err && artifact) {
                    artifact.title = req.body.title;
                    artifact.description = req.body.description;
                    if (req.file) {
                        artifact.photo = req.file.location;
                    }
                    artifact.save(function(err, updated) {
                        if (updated) {
                            console.log(artifact);
                            fetchArtifactByID(req, res);
                        } else {
                            res.sendStatus(500);
                        }
                    });
                } else {
                    res.cookie('sessionId', '');
                    res.redirect('/login')
                }
            });
        } else {
            res.sendStatus(500);
        }
    })
}


// Connect to the db
const dbURI =
    "mongodb+srv://priscilla:A9qiVFZSiqjFhfgm@cluster0-guonz.mongodb.net/test?retryWrites=true";


module.exports = {
    showIndex,
    fetchLogin,
    fetchSignup,
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
    fetchArtifactsByUser,
    createArtifact,
    send,
    verify,
    fetchArtifactByID,
    findUserByName,
    searchUser,
    searchResults,
    addComment,
    deleteArtifact,
    deleteComment,
    fetchPost,
    editArtifact,
    fetchArtifactByID
}

