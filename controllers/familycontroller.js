const mongoose = require('mongoose');
const Artifact = require('../models/artifact');
const User = require('../models/user');
const Group = require('../models/familygroups');
var express = require('express');
var app = express();

const controllers = require('../controllers/controllers.js');

var createGroup = function(req,res){

    var group = new Group({
        "title":req.body.title,
        "photo":req.body.b64,
        "description":req.body.description,
    });

    var sid = req.cookies.sessionId;


    User.find({sessionId:sid}, function(err, user){
        if (!err){
            group.owner = user[0]._id;
            group.save(function(err, newGroup){
                if (!err){
                    if (user[0].groups == undefined) {
                        User.update({sessionId:sid}, {'groups':group._id});
                    } else {
                        user[0].groups.push(group._id);
                        user[0].save();
                    }
                    res.render('homepage.pug', {title: 'Inherit'});
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
                            Category.find({}, function(err, categories){
                                if (!err){
                                    var results = {group: group, owner: owner,
                                        user: currUser[0], session: sid};
                                    res.render('family.pug', results);
                                } else {
                                    res.sendStatus(400);
                                }
                            });
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

