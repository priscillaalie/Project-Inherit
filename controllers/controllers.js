const mongoose = require('mongoose');
const utils = require('./utils.js');
const Artifact = require('../models/artifact');
const User = require('../models/user');
const nodemailer = require('nodemailer');


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
};


var smtpTransport = nodemailer.createTransport({
    host: 'mail.google.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'projectinherit28@gmail.com', // generated ethereal user
        pass: 'iwant2commit' // generated ethereal password
    },
    tls: {
        rejectUnauthorized:false
    }
});


var rand,mailOptions,host,link;

var emailSend =function(req,res){
    rand=Math.floor((Math.random() * 100) + 54);
    host=req.get('host');
    link="http://"+req.get('host')+"/verify?id="+rand;
    mailOptions={
        to : req.query.to,
        subject : "Please confirm your Email account",
        html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"
    }
    console.log(mailOptions);
    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
            res.end("error");
        }else{
            console.log("Message sent: " + response.message);
            var results = {title: 'Inherit', error: message};
            res.render('send', results);
            res.end("sent");
        }
    });

};

var emailVerify = function(req,res){
    console.log(req.protocol+":/"+req.get('host'));
    if((req.protocol+"://"+req.get('host'))==("http://"+host)) {
        console.log("Domain is matched. Information is from Authentic email");
        if(req.query.id==rand){
            console.log("email is verified");
            var results = {title: 'Inherit', error: message};
            res.render('verify', results);

            res.end("<h1>Email "+mailOptions.to+" is been Successfully verified");
        }else{
            console.log("email is not verified");
            res.end("<h1>Bad Request</h1>");
        }
    }else{
        res.end("<h1>Request is from unknown source");
    }
};

var createUser = function(req,res){
    if (req.body.password.length < 8){
        var message = "Password must be more than 7 characters";
        var results = {title: 'Inherit', error: message,
            email: req.body.email, fname: req.body.fname, phone: req.body.phone,
            lname: req.body.lname, birthday: req.body.birthday};
        res.render('signup', results);
    } else {
        bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
            let user = new User({
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



module.exports = {
    showIndex,
    fetchLogin,
    fetchSignup,
    fetchProfile,
    fetchIntro,
    addUser,
    //sendEmail,
    //verifyEmail,
    emailSend,
    emailVerify,
    createUser
}

