const multer = require('multer')



//multer for the products images upload
const allowedFileTypes = ['image/jpeg', 'image/png', 'image/webp'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'productImages'); // Destination folder for uploaded images
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname); // Unique filename for each uploaded image
  }
});

console.log("multer");


const fileFilter = (req, file, cb) => {
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error(' Only JPG and PNG images are allowed.'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports ={upload}
