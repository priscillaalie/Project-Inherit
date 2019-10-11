/*
index.js contains routes to call the basic routes and connect functions, namely controllers/controllers.js
- showing home page
- login
- sign up
- viewing settings
- family group
- showing profile
- showing artifacts
- adding artifacts
- sending verification email
- verifying email
- logging out
 */
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var user = require('../models/user.js');

settingsRoutes = require('./settings');

var app = express();
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit:'50mb', extended: true, parameterLimit:50000}));
app.use(bodyParser.json());

app.use('/settings', settingsRoutes);

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

router.get('/home', controllers.fetchHomepage);

router.get('/myartifacts', function(req, res){
  if (req.cookies.sessionId) {
    controllers.fetchAntiquesByUser(req, res);
  } else {
    res.redirect('/login');
  }
});

router.post('/addartifact', controllers.createAntique)

router.post('/signup', controllers.createUser);

router.post('/login', controllers.checkUser);

router.get('/verify', controllers.verify);

router.get("/logout", function(req, res){
  res.cookie('sessionId', '');
  res.redirect('/');
});

router.get('/resend', controllers.getStarted);
router.get('/view/:id/info', famcontrollers.fetchGroupInfo);
router.get('/view/:id/members', famcontrollers.fetchGroupMembers);
router.post('/create', famcontrollers.createGroup);
router.get('/view/:id', famcontrollers.fetchGroupByID);
router.get('/artifact/view/:id', controllers.fetchArtifactByID);
router.post('/view/:id', function(req, res) {
  famcontrollers.editGroup(req,res);
});
router.post('/post', controllers.addComment);
router.get('/addmember/:id', famcontrollers.addMember);



module.exports = router;
