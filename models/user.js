var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var crypto = require('crypto');

// defining user schema
var userSchema = new mongoose.Schema({
    "email": {
        type: String,
        lowercase: true,
        unique: true,
        required: [true, "can't be blank"],
        match: [/\S+@\S+\.\S+/, 'is invalid'],
        index: true
    },
    "fname": {
        type: String,
        required: true,
    },
    "lname": {
        type: String,
        required: true,
    },
    "photo": String,
    "birthday": Date,
    "phone": String,
    "password": String,
    "sessionId": String,
    "artifacts": Array
});

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


module.exports = User;
