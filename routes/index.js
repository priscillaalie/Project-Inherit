var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var app = express()
var user = require('../models/user.js');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const controllers = require('../controllers/controllers.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Project Inherit' });
});

//router.get('/', controllers.fetchIndex);


router.get('/login', controllers.fetchLogin);
router.get('/signup', controllers.fetchSignup);
router.post('/add', controllers.addUser);
router.post('/login', user.checkUser);

module.exports = router;