var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var crypto = require('crypto');

const controllers = require('../controllers/controllers.js');

// defining user schema
var userSchema = new mongoose.Schema({

    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: [true, "can't be blank"],
        match: [/\S+@\S+\.\S+/, 'is invalid'],
        index: true
    },

    name: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        hash: String,
    },
    photo: String

}, {timestamps: true});

userSchema.plugin(uniqueValidator, {message: 'is already taken.'});


// password hashing
userSchema.methods.setPassword = function(password){
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    };

userSchema.methods.validPassword = function(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return this.hash === hash;
    };


const User = mongoose.model('User', userSchema);


var checkUser = function(req,res) {
    // check if user exists
    User.countDocuments({'email': req.body.email}, function (err, count){ 
    if(count>0){
        console.log("user exists");
        User.findOne({'email':req.body.email}, function (error, person) {
            if (err) console.log(err);
            if (req.body.password != person.password) {
                res.send("Incorrect Password");
            } else {
                res.render('profile.pug', {title: 'Signup'});
                //controllers.fetchLogin;
            }
            console.log(person.password);
        });
    } else {
        console.log("user does not exist");
    }
    console.log(req.body);
}); 
}

module.exports = User;
module.exports.checkUser = checkUser;
