var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var user = require('../models/user.js');

settingsRoutes = require('./settings');


var app = express();

app.use('/settings', settingsRoutes);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const controllers = require('../controllers/controllers.js');
const famcontrollers = require('../controllers/familycontroller.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Project Inherit' });
});


router.get('/login', controllers.fetchLogin);
router.get('/signup', controllers.fetchSignup);
router.get('/profile', controllers.fetchProfile);
router.get('/getstarted', controllers.fetchIntro);
router.get('/home', controllers.fetchHomepage);
//router.get('/settings',controllers.fetchSettings);
//router.get('/settings*', settings.settingsRoute);


router.post('/signup', controllers.createUser);
router.post('/login', controllers.checkUser);
router.get("/logout", function(req, res){
  res.cookie('sessionId', '');
  res.redirect('/');
});

router.post('/create', famcontrollers.createGroup);
router.get('/view/:id', famcontrollers.showGroupByID);


module.exports = router;
