const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Dynamic storage setup with error handling
const getStorage = (folder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      try {
        const uploadPath = `uploads/${folder}`;
        // Ensure folder exists
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
      } catch (error) {
        console.error('Upload directory creation error:', error);
        cb(error);
      }
    },
    filename: (req, file, cb) => {
      try {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
      } catch (error) {
        console.error('Filename generation error:', error);
        cb(error);
      }
    }
  });

const fileFilter = (req, file, cb) => {
  try {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error('Only images are allowed'));
  } catch (error) {
    console.error('File filter error:', error);
    cb(error);
  }
};

const getUploader = (folder) => {
  try {
    return multer({
      storage: getStorage(folder),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter
    });
  } catch (error) {
    console.error('Multer initialization error:', error);
    // Return a basic multer instance as fallback
    return multer({ dest: 'uploads/' });
  }
};

module.exports = getUploader;
