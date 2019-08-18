const express = require('express');
const app = express();

var Login = function (req,res) {
    res.render('login.pug', {title: 'Login'});
};

module.exports.fetchLogin = Login;