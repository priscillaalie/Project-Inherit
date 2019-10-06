/*
comment.js contains the mongodb atlas schema for storing comments that will be displayed on individual artifacts
 */

var mongoose = require('mongoose');

var commentSchema = mongoose.Schema(
    {
        "id": String,
        "owner":String,
        "content":String,
        "artifact": String,
        "created": Date,
        //timestamps: true
    }
);
module.exports = mongoose.model('Comment', commentSchema);
