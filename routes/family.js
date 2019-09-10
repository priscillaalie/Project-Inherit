var express = require('express');
var router = express.Router();

const famcontrollers = require('../controllers/familycontroller.js');


router.post('/create', famcontrollers.createGroup);
router.get('/view/:id', famcontrollers.showGroupByID);

module.exports = router;