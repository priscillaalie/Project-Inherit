var express = require('express');
var router = express.Router();

var app = express()
var user = require('../models/user.js');

const controllers = require('../controllers/controllers.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Project Inherit' });
});

//router.get('/', controllers.fetchIndex);


router.get('/login', controllers.fetchLogin);
router.get('/signup', controllers.fetchSignup);
router.get('/profile', controllers.fetchProfile);
router.get('/getstarted',controllers.fetchIntro);

router.post('/signup', controllers.createUser, controllers.emailSend);
//router.post('/signup', controllers.emailSend);
router.get('/verify', controllers.emailVerify);


module.exports = router;
