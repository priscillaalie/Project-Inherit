var express = require('express');
var router = express.Router();

const famcontrollers = require('../controllers/familycontroller.js');


router.post('/create', famcontrollers.createGroup);
router.get('/view/:id', famcontrollers.showGroupByID);

router.post('/updateGroup', function(req, res){
    console.log("weewwrwe");
    if (req.cookies.sessionId) {
        famcontrollers.editGroup(req, res);
    } else {
        res.redirect('/login');
    }
});

module.exports = router;
