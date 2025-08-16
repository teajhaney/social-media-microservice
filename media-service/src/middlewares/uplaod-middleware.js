const multer = require('multer');
const path = require('path');

//set our multer storage

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + '-' + Date.now() + path.extname(file.originalname)
    );
  },
});

const checkFileType = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image!Please upload an image'));
  }
};

//multer middleware

const multerMiddleware = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, //5MB
  fileFilter: function (req, file, cb) {
    checkFileType(req, file, cb);
  },
});

module.exports = multerMiddleware;
