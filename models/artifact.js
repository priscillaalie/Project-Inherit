var mongoose = require('mongoose');

var artifactSchema = mongoose.Schema(
    {
        "id": String,
        "title":String,
        "description":String,
        "familygroup": String,
        "photo":String,
        "owner":String,
        "category":String,
        "created":Date
    }
);
module.exports = mongoose.model('Artifact', artifactSchema);
