/*
utils.js contains functions for:
- creating unique keys for passwords
- verifying user accounts 
 */
const User = require('../models/user');
var crypto = require('crypto');

const generate_key = () => {
    var sha = crypto.createHash('sha256');
    sha.update(Math.random().toString());
    return sha.digest('hex');
};

const generate_unique_sid = async () => {
    let key = generate_key();
    let unique = false;
    while (!unique) {
        try {
            const duplicate = await (User.findOne({sessionId:key}).exec());
            if (duplicate) {
                unique = false;
                key = generate_key();
            } else {
                unique = true
            }
        } catch (e) {
            console.log('exception: ' + e);
            unique = true
        }
    }
    return key;
};

function verify_logged_in(sid, callback) {
    User.findOne({sessionId: sid}, function(err, user) {
        var feedback = !!(!err && user);
        callback(feedback);
    });
}

module.exports = {
    generate_unique_sid,
    verify_logged_in
};

