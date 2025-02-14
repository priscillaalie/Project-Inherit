var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = require('../services/file-uploader');
var multiupload = multer();
var singleUpload = upload.single('image');

router.post('/image-upload', function(req, res) {
	singleUpload(req, res, function(err) {
		return res.json({'imageUrl':req.file.location})
	})
});


module.exports = router;