/*
familycontroller.js defines and contains functions that are related to family groups
This includes functions to:
- Create a New Group
- Display Group
- Edit Group
 */
const mongoose = require('mongoose');
const Artifact = require('../models/artifact');
const User = require('../models/user');
const Group = require('../models/familygroups');
var express = require('express');
var app = express();


var upload = require('../services/file-uploader');
var singleUpload = upload.single('image');

var createGroup = function(req,res){
    singleUpload(req, res, function(err) {
        if (req.file) {
            var group = new Group({
                "title":req.body.title,
                "photo":req.file.location,
                "description":req.body.description,
            });
        } else {
            var group = new Group({
                "title":req.body.title,
                "description":req.body.description,
            });
        }

        var sid = req.cookies.sessionId;

        User.findOne({sessionId:sid}, function(err, user){
            if (!err){
                group.owner = user._id;
                group.members.push(user._id);
                console.log(group);
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
    });
};


var fetchGroupByID = function(req, res) {
    var ID = req.params.id;
    Group.findById(ID, function(err, group) {
        if(!err){
            User.findById(group.owner, function(err, owner){
                if (!err){
                    var sid = req.cookies.sessionId;
                    User.find({sessionId: sid}, function(err, currUser){
                        if (!err){
                            Artifact.find({'_id': {$in: group.artifacts}}, function(err, artifacts) {
                                User.find({'_id': {$in: group.members}}, function(err, members) {
                                    Group.find({'_id': {$in: currUser[0].groups}}, function (err, familygroups) {
                                        if (!err) {
                                            var results = {group: group, owner: owner,
                                                user: currUser[0], session: sid, artifacts: artifacts,
                                                members:members, familygroups: familygroups, title: group.title};
                                            res.render('family.pug', results);
                                        } else {
                                            res.sendStatus(500);
                                        }
                                    })
                                })
                            })
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

var editGroup = function(req, res){
    Group.findById(req.originalUrl.split('/')[2], function(err, group) {
        if (!err && group) {
            group.title = req.body.title;
            group.description = req.body.description;
            group.owner = req.body.owner;

            group.save(function(err, updatedGroup) {
                if (updatedGroup) {
                    let message = "Your family has been updated";
                    Artifact.find({'_id': {$in: group.artifacts}}, function(err, artifacts) {
                        User.find({'_id': {$in: group.members}}, function(err, members) {
                            var results = {group: group, owner: group.owner,
                                user: updatedGroup, session: req.cookies.sessionId, artifacts: artifacts,
                                    members:members, error: message};
                            res.render('family.pug', results);
                        })
                    })
                } else {
                    res.sendStatus(500);
                }
            });
        } else {
            res.cookie('sessionId', '');
            res.redirect('/login')
        }
    });
};

var fetchGroupInfo = function(req, res) {
    var groupId = req.headers.referer.split('/')[4];
    if (req.cookies.sessionId) {
        Group.findById(groupId, function(err, group) {
            if (!err) {
                User.find({'_id': {$in: group.members}}, function(err, members) {
                    if (!err) {
                        res.render('familyInfo.pug', {group:group, members:members, session:req.cookies.sessionId});
                    } else {
                        res.sendStatus(500);
                    }
                })
            } else {
                res.sendStatus(404);
            }
        })
    } else {
        res.redirect('/signup');
    }
}

var fetchGroupMembers = function(req, res) {
    var groupId = req.headers.referer.split('/')[4];
    if (req.cookies.sessionId) {
        Group.findById(groupId, function(err, group) {
            if (!err) {
                User.find({}, function(err, members) {
                    if (!err) {
                        res.render('members.pug', {group:group, members:members, session:req.cookies.sessionId});
                    } else {
                        res.sendStatus(500);
                    }
                })
            } else {
                res.sendStatus(404);
            }
        })
    } else {
        res.redirect('/signup');
    }
}

var addMember = function(req, res) {
    var userId = req.url.split('/')[2]; // ????
    var groupId = req.headers.referer.split('/')[4];
    Group.findById(groupId, function(err, group) {
        if (!err) {
            group.members.push(userId);
            User.findById(userId, function(err, user) {
                if (!err) {
                    user.groups.push(groupId);
                    user.save();
                    group.save();
                    console.log(group);
                    console.log(user);
                    res.redirect('/view/' + groupId + '/members');
                } else {
                    res.sendStatus(500);
                }
            })
        } else {
            res.sendStatus(404);
        }
    })
}


module.exports = {
    createGroup,
    fetchGroupByID,
    fetchGroupInfo,
    editGroup,
    fetchGroupMembers,
    addMember
}

