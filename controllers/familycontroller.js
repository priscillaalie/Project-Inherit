const mongoose = require('mongoose');
const Artifact = require('../models/artifact');
const User = require('../models/user');
const Group = require('../models/familygroups');
var express = require('express');
var app = express();

const controllers = require('../controllers/controllers.js');

var createGroup = function(req,res){

    console.log(req.body.b64);
    var group = new Group({
        "title":req.body.title,
        "photo":req.body.b64,
        "description":req.body.description,

    });

    var sid = req.cookies.sessionId;


    User.findOne({sessionId:sid}, function(err, user){
        if (!err){
            group.owner = user._id;
            group.save(function(err, newGroup){
                if (!err){
                    user.groups.push(group._id);
                    user.save();
                    res.redirect('/home');
                } else {
                    res.sendStatus(400);
                }
            });
        } else {
            res.sendStatus(400);
        }
    });
};


var showGroupByID = function(req, res) {
    var ID = req.params.id;
    Group.findById(ID, function(err, group) {
        if(!err){
            User.findById(group.owner, function(err, owner){
                if (!err){
                    var sid = req.cookies.sessionId;
                    User.find({sessionId: sid}, function(err, currUser){
                        if (!err){
                            var results = {group: group, owner: owner,
                                user: currUser[0], session: sid, artifacts: group.artifacts};
                            console.log('rendering');
                            res.render('family.pug', results);
                            console.log('rendered');
                        } else {
                            res.sendStatus(400);
                        }
                    });
                }else{
                    res.sendStatus(404);
                }
            });
        }else{
            res.sendStatus(404);
        }
    });
};

module.exports = {
    createGroup,
    showGroupByID
}

