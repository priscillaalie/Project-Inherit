var mongoose = require('mongoose');

var groupSchema = mongoose.Schema(
    {
        "id": String,
        "title":String,
        "description":String,
        "photo": String,
        "owner": String, //want to connect this to a user id
        "members":Array,
        "posts": Array
    }
);
module.exports = mongoose.model('Group', groupSchema);
