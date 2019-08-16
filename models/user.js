var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

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
    }


}, {timestamps: true});

userSchema.plugin(uniqueValidator, {message: 'is already taken.'});



const User = mongoose.model('User', userSchema);
module.exports = User;
