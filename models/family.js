var mongoose = require('mongoose');

// defining family schema
var familySchema = new mongoose.Schema({
    "familyname": {
        type: String,
        required:true,
    },
    "artifacts": Array,
    "members": Array,
    "photo": String,
});

const Family = mongoose.model('Family', familySchema);

module.exports = Family;

