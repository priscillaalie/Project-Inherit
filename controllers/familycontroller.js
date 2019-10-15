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
const Post = require('../models/post');

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
                    User.findOne({sessionId: sid}, function(err, user){
                        if (!err){
                            Artifact.find({'_id': {$in: group.artifacts}}, function(err, artifacts) {
                                User.find({'_id': {$in: group.members}}, function(err, members) {
                                    Group.find({'_id': {$in: user.groups}}, function (err, familygroups) {
                                        if (!err) {
                                            var results = {group: group, owner: owner,
                                                user: user, session: sid, artifacts: artifacts,
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
    singleUpload(req, res, function(err) {
        if (!err) {
            Group.findById(req.originalUrl.split('/')[2], function(err, group) {
                if (!err && group) {
                    group.title = req.body.title;
                    group.description = req.body.description;
                    group.owner = req.body.owner;
                    if (req.file) {
                        group.photo = req.file.location;
                    }
                    group.save(function(err, updatedGroup) {
                        if (updatedGroup) {
                            console.log(group);
                            fetchGroupByID(req, res);
                        } else {
                            res.sendStatus(500);
                        }
                    });
                } else {
                    res.cookie('sessionId', '');
                    res.redirect('/login')
                }
            });
        } else {
            res.sendStatus(500);
        }
    })
};

var fetchGroupInfo = function(req, res) {
    var groupId = req.headers.referer.split('/')[4];
    if (req.cookies.sessionId) {
        Group.findById(groupId, function(err, group) {
            if (!err) {
                User.find({'_id': {$in: group.members}}, function(err, members) {
                    if (!err) {
                        User.findOne({sessionId:req.cookies.sessionId}, function(err, user) {
                            if (!err) {
                                User.findById(group.owner, function(err, owner) {
                                    if (!err) {
                                        res.render('familyInfo.pug', { group:group, members:members, 
                                            session:req.cookies.sessionId, user:user, owner:owner});
                                    } else {
                                        res.sendStatus(500);
                                    }
                                })
                                
                            } else {
                                res.sendStatus(500);
                            }
                        })
                    } else {
                        res.sendStatus(500);
                    }
                })
            } else {
                res.sendStatus(404);
            }
        })
    } else {
        res.redirect('/login');
    }
}

var fetchGroupPost = function(req, res) {
    var groupId = req.headers.referer.split('/')[4];
    if (req.cookies.sessionId) {
        Group.findById(groupId, function(err, group) {
            if (!err) {
                User.find({'_id': {$in: group.members}}, function(err, members) {
                    if (!err) {
                        Post.find({'_id':{$in: group.posts}}, function(err, posts) {
                            if (!err) {
                                User.findOne({sessionId:req.cookies.sessionId}, function(err, user) {
                                    if (!err) {
                                        res.render('familypost.pug', {group:group, members:members,
                                        posts:posts, session:req.cookies.sessionId, user:user});
                                    } else {
                                        res.sendStatus(500);
                                    }
                                })
                            } else {
                                res.sendStatus(500);
                            }
                        })
                    } else {
                        res.sendStatus(500);
                    }
                })
            } else {
                res.sendStatus(404);
            }
        })
    } else {
        res.redirect('/login');
    }
}



var fetchGroupMembers = function(req, res) {
    var groupId = req.headers.referer.split('/')[4];
    if (req.cookies.sessionId) {
        Group.findById(groupId, function(err, group) {
            if (!err) {
                User.find({}, function(err, members) {
                    if (!err) {
                        User.findOne({sessionId:req.cookies.sessionId}, function(err, user) {
                            if (!err) {
                                User.findById(group.owner, function(err, owner) {
                                    if (!err) {
                                        console.log(user._id.equals(owner._id));
                                        res.render('members.pug', {group:group, members:members, session:req.cookies.sessionId,
                                            user:user, owner:owner});
                                    } else {
                                        res.sendStatus(500);
                                    }
                                })
                            } else {
                                res.sendStatus(500);
                            }
                        })
                    } else {
                        res.sendStatus(500);
                    }
                })
            } else {
                res.sendStatus(404);
            }
        })
    } else {
        res.redirect('/login');
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

var deleteGroup = function(req, res) {
    var groupId = req.url.split('/')[2];
    Group.findById(groupId, function(err, group) {
        if (!err) {
            User.find({'_id':{$in: group.members}}, function(err, members) {
                if (!err) {
                    // deleting group from all members
                    for (var i=0;i<members.length;i++) {
                        var position = members[i].groups.indexOf(groupId);
                        members[i].groups.splice(position, 1);
                        members[i].save();
                    }
                    // deleting all artifacts in the group
                    Artifact.find({'_id':{$in: group.artifacts}}, function(err, artifacts) {
                        if (!err) {
                            for (var i=0;i<artifacts.length;i++) {
                                // removing artifact's group
                                artifacts[i].familygroup = "None";
                                artifacts[i].save();
                            }
                            //finally delete the group
                            Group.deleteOne({'_id':groupId}, function(err) {
                                if (!err) {
                                    console.log('group successfully deleted');
                                    res.redirect('/home');
                                } else {
                                    console.log('group failed to delete' + err.message);
                                    res.sendStatus(500);
                                }
                            })
                        } else {
                            res.send(500);
                        }
                    })
                } else {
                    res.send(500);
                }
            })
        } else {
            res.send(404);
        }
    })
}

var leaveGroup = function(req, res) {
    var groupId = req.headers.referer.split('/')[4];
    console.log(groupId);
    User.findOne({sessionId:req.cookies.sessionId}, function(err, user) {
        if (!err) {
            Group.findById(groupId, function(err, group) {
                if (!err) {
                    // removing all artifacts of user from group
                    for (var i=0;i<user.artifacts.length;i++) {
                        if (group.artifacts.includes(user.artifacts[i])) {
                            var position = group.artifacts.indexOf(user.artifacts[i]);
                            group.artifacts.splice(position, 1);
                            // assigning no family to that artifact
                            Artifact.findById(user.artifacts[i], function(err, artifact) {
                                console.log(artifact);
                                if (!err) {
                                    artifact.familygroup = 'None';
                                    artifact.save();
                                } else {
                                    res.sendStatus(500);
                                }
                            })
                        }
                    }
                    // remove user from group
                    var position = group.members.indexOf(user._id);
                    group.members.splice(position, 1);
                    group.save();
                    // remove group from user
                    position = user.groups.indexOf(group._id);
                    user.groups.splice(position, 1);
                    user.save();
                    res.redirect('/home');
                } else {
                    res.sendStatus(500);
                }
            })
        } else {
            res.sendStatus(500);
        }
    })
}

var addPost = function(req, res) {
    var groupId = req.headers.referer.split('/')[4];
    console.log(groupId);
    User.findOne({sessionId: req.cookies.sessionId}, function(err, user) {
        Group.findById(groupId, function(err, group) {
            if (!err) {
                var post = new Post({
                    "owner": user._id,
                    "content": req.body.post,
                    "familygroup": groupId,
                    "ownername": user.name
                })
                post.created = Date.now();
                console.log(post);
                post.save(function(err, newPost) {
                    if (!err) {
                        group.posts.push(post._id);
                        group.save();
                        res.redirect('/view/' + groupId + '/post');
                    } else {
                        res.sendStatus(400);
                    }
                }) 
            } else {
                res.sendStatus(500);
            }
        })
    });
}

var deletePost = function(req, res) {
    var postId = req.url.split('/')[2];
    console.log(postId);
    var groupId;
    Post.findById(postId, function(err, post) {
        if (!err) {
            groupId = post.familygroup;
            Group.findById(groupId, function(err, group) {
                if (!err) {
                    var position = group.posts.indexOf(postId);
                    group.posts.splice(position, 1);
                    console.log(group);
                    group.save();
                    Post.deleteOne({'_id': commentId}, function(err, result) {
                        if (!err) {
                            console.log('post deleted');
                            res.redirect('/view/' + groupId + '/post');
                        } else {
                            console.log(err);
                            console.log('failed to delete post');
                        }
                    })
                } else {
                    res.sendStatus(500);
                }
            })
        } else {
            res.sendStatus(404);
        }
    })
}

var removeMember = function(req, res) {
    var groupId = req.headers.referer.split('/')[4]
    var memberId = req.url.split('/')[2];
    console.log(groupId);
    console.log(memberId);
    Group.findById(groupId, function(err, group) {
        if (!err) {
            User.findById(memberId, function(err, member) {
                if (!err) {
                    // remove group from member
                    var position = member.groups.indexOf(groupId);
                    member.groups.splice(position, 1);
                    member.save();
                    // remove all of member's artifacts
                    for (var i=0;i<member.artifacts.length;i++) {
                        if (group.artifacts.includes(member.artifacts[i])) {
                            // change each artifact's group to None
                            Artifact.findById(member.artifacts[i], function(err, artifact) {
                                if (!err) {
                                    artifact.familygroup = "None";
                                    artifact.save();
                                } else {
                                    res.sendStatus(500);
                                }
                            })
                            // remove each of member's artifacts from group
                            position = group.artifacts.indexOf(member.artifacts[i]);
                            group.artifacts.splice(position, 1);
                            group.save();
                        }
                    }
                    // remove member from group
                    position = group.members.indexOf(memberId);
                    group.members.splice(position, 1);
                    group.save();
                    res.redirect('/view/' + groupId + '/info');
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
    fetchGroupPost,
    addMember,
    deleteGroup,
    leaveGroup,
    addPost,
    deletePost,
    removeMember
}

