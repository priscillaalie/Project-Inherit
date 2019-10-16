/*
app.js is the first point of call for the server
it contains the variables and connects the controllers, public, routes and views
app.js also catches errors and sets a local port for local hosting
 */

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var loginRouter = require('./routes/login');
var searchRouter = require('./routes/search');
var settingsRouter = require('./routes/settings');
var imageRouter = require('./routes/images');

var app = express();

const pug = require('pug');
// view engine setup

app.use(express.static('public' + '/'));
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/search',searchRouter);
app.use('/settings', settingsRouter);
app.use('/', imageRouter);

// Connect to Database
require('./models/db.js');

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


// setting port
const PORT = process.env.PORT || 3000 ;
// app loading on server
app.listen(PORT, function(){
    console.log(`Express listening on port ${PORT}`);
});

module.exports = app;
