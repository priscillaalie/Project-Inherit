/*
family
 */
var mongoose = require('mongoose');

var groupSchema = mongoose.Schema(
    {
        "id": String,
        "title":String,
        "description":String,
        "photo": String,
        "owner": String,
        "members":Array,
        "posts": Array,
        "artifacts": Array,
        "familytree": String
    }
);
module.exports = mongoose.model('Group', groupSchema);
