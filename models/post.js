/*
comment.js contains the mongodb atlas schema for storing comments that will be displayed on individual artifacts
 */

var mongoose = require('mongoose');

var postSchema = mongoose.Schema(
    {
        "id": String,
        "owner":String,
        "ownername": String,
        "photo": Array,
        "content":String,
        "familygroup": String,
        "created": Date,
        //timestamps: true
    }
);
module.exports = mongoose.model('Post', postSchema);
