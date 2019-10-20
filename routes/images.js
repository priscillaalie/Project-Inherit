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


router.post('/multi-upload', multiupload.array('uploadedImages', 10), function(req, res, err) {
	if (err) {
		console.log('error');
		console.log(err);
	}
	var file = req.files;
	res.end();
	console.log(req.files);
});

module.exports = router;