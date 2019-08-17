var express = require('express');
var router = express.Router();

const controllers = require('../controllers/controllers.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Project Inherit' });
});

//router.get('/', controllers.fetchIndex);


module.exports = router;