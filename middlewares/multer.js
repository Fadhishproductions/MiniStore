const multer = require('multer');
const path = require('path');

const imagetypes = /jpeg|jpg|svg|png|webp/; 
const baseImageUrl = 'D:\web designing\nodejs tuto\ministore\public\productimages';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'public', 'productimages')); // Remove the unnecessary function callback
  },
  filename: function (req, file, cb) {
    const imageFilename = Date.now() + '-' + file.originalname;
    console.log(imageFilename, 'image file');
    cb(null, imageFilename);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const extName = imagetypes.test(path.extname(file.originalname).toLowerCase()); // Fix the typo
    const mimeType = imagetypes.test(file.mimetype);
    console.log('images1');
    if (extName && mimeType) {
      console.log('images');
      return cb(null, true);
    } else {
      return cb(new Error('Invalid file type'), false);
    }
  },
});

module.exports = upload;
