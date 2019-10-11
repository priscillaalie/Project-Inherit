/*
post.js contains the mongodb atlas schema for storing posts that will be displayed on family groups
 */

var mongoose = require('mongoose');

var commentSchema = mongoose.Schema(
    {
        "id": String,
        "owner":String,
        "ownername": String,
        "content":String,
        "familygroup": String,
        "created": Date,
        "photo": String,
        //timestamps: true
    }
);
module.exports = mongoose.model('Comment', commentSchema);
