/*
family.js is defining the family schema
 */

var mongoose = require('mongoose');

var familySchema = new mongoose.Schema({
    "familyname": {
        type: String,
        required:true,
    },
    "artifacts": Array,
    "members": Array,
    "description": String,
    "familyphoto": String,
});

const Family = mongoose.model('Family', familySchema);

module.exports = Family;

