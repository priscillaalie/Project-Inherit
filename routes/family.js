/*
family.js contains the routes that call family functions from controllers/familycontroller.js
- creating group
- viewing group
- updating group
 */

var express = require('express');
var router = express.Router();

const famcontrollers = require('../controllers/familycontroller.js');


router.post('/create', famcontrollers.createGroup);
router.get('/view/:id', famcontrollers.showGroupByID);
router.get('/view/info/:id', famcontrollers.showGroupInfo);

router.post('/updateGroup', function(req, res){
    if (req.cookies.sessionId) {
        famcontrollers.editGroup(req, res);
    } else {
        res.redirect('/login');
    }
});

module.exports = router;
