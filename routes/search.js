var express = require('express');
var router = express.Router();

var controller = require('../controllers/controllers.js');

//autocomplete search for search bar
router.get('/list/:input', controller.searchUser);

//autocomplete search for search bar within My Listings
router.get('/userlist/:input/:user', controller.findUserByName);

//searching for listings, search results
router.get('/', controller.searchResults);

module.exports = router;
