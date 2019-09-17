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


router.get('/login', function(req, res){
  // if (req.cookies.sessionId) {
  //   res.redirect('/');
  // } else {
  //   controllers.fetchLogin(req, res);
  // }
  controllers.fetchLogin(req, res);
});

router.get('/signup', function(req, res){
  // if (req.cookies.sessionId) {
  //   res.redirect('/');
  // } else {
  //   controllers.fetchSignup(req, res);
  // }
  controllers.fetchSignup(req, res);
});

router.get('/profile', controllers.fetchProfile);
router.get('/getstarted', controllers.fetchIntro);

router.get('/home', controllers.fetchHomepage);

router.get('/myantiques', function(req, res){
  if (req.cookies.sessionId) {
    controllers.fetchAntiquesByUser(req, res);
  } else {
    res.redirect('/login');
  }
});

router.post('/addantique', controllers.createAntique)

router.post('/signup', controllers.createUser);

router.post('/login', controllers.checkUser);

router.get("/logout", function(req, res){
  res.cookie('sessionId', '');
  res.redirect('/');
});

router.post('/create', famcontrollers.createGroup);
router.get('/view/:id', famcontrollers.showGroupByID);


module.exports = router;
