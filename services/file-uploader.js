var aws = require('aws-sdk');
var express = require('express');
var multer = require('multer');
var multerS3 = require('multer-s3');

aws.config.update({
    "accessKeyId":"AKIAIPXBMZSIV5BHU7GA",
    "secretAccessKey":"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",
    "region":"us-east-2"
});

var app = express();
var s3 = new aws.S3();
 
var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'project-inherit',
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: 'metadata'});
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString())
    }
  })
})

module.exports = upload;