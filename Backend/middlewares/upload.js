const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Dynamic storage setup
const getStorage = (folder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = `uploads/${folder}`;
      // Ensure folder exists
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (extname && mimetype) return cb(null, true);
  cb(new Error('Only images are allowed'));
};

const getUploader = (folder) =>
  multer({
    storage: getStorage(folder),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter
  });

module.exports = getUploader;
