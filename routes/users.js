var express = require('express');
var router = express.Router();

const controller = require('../controllers/controllers');
const UserController = require('../controllers/userController');


/* GET users listing. */
/*
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// login
router.get('/login', controller.fetchLogin);


// create user
router.post('/users', UserController.createUser)


*/



module.exports = router;
