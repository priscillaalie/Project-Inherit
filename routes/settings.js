/*
settings.js contains the routes that are used for the settings page
- showing settings page
- updating settings page
- deleting user account
 */
const express = require('express');
const controller = require('../controllers/controllers.js');
const router = express.Router();

//show the settings page
router.get('/general', function(req, res){
    if (req.cookies.sessionId) {
        controller.fetchSettings(req, res);
    } else {
        res.redirect('/login');
    }
});

//show the security settings page
router.get('/security', function(req, res){
    if (req.cookies.sessionId) {
        controller.fetchPrivacy(req, res);
    } else {
        res.redirect('/login');
    }
});

// Delete user account form page
router.get('/delete', function(req,res){
    if (req.cookies.sessionId) {
        controller.fetchDeleteAccount(req, res);
    } else {
        res.redirect('/login');
    }
});

//redirect settings to general settings
router.get('/', function(req, res){
    res.redirect('/settings/general');
});

//update general settings
router.post('/general', function(req, res){
    if (req.cookies.sessionId) {
        controller.editUser(req, res);
    } else {
        res.redirect('/login');
    }
});

//update security settings
router.post('/security', function(req, res){
    if (req.cookies.sessionId) {
        controller.editPassword(req, res);
    } else {
        res.redirect('/login');
    }
});

// Delete user confirmed
router.post('/delete', function(req, res){
    if (req.cookies.sessionId){
        controller.deleteUser(req, res);
    } else {
        res.redirect('/login');
    }
});

module.exports = router;

