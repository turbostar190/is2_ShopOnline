const express = require('express');
const productControllers = require('../controllers/products.controllers');
const checkAuth = require('../middleware/checkAuth.middleware')
const router = express.Router();
const multer = require('multer');

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
  
var upload = multer({ storage: storage });

router.post('/', checkAuth, upload.single('img'), productControllers.postProducts);
router.get('/', productControllers.getProducts);
module.exports = router