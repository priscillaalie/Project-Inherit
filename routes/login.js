var express = require('express');
var router = express.Router();

//const controllers = require('../controllers/controllers.js');

/* GET home page. */
router.get('/login', function(req, res, next) {
    res.render('login', { title: 'Project Inherit' });
});

//router.get('/', controllers.fetchIndex);


//router.get('/login', controllers.fetchLogin);

module.exports = router;