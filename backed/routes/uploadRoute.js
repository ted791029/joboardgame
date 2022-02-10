const express = require('express');

const multer = require('multer');

const router = express.Router();

const uploadController = require('../Controllers/uploadController');



const storage = multer.diskStorage({

    destination: '../web/dist/uploads/avatar/',
    filename: (req, file, cb) => {
        const fileArr = file.originalname.split('.');
        const imgName = req.decoed.memberId + '.' + fileArr[1];
         req.imgName = imgName;
        cb( null, imgName);
    }
});

const upload = multer({storage:storage});

router.post('/avatar', upload.single('avatar'), uploadController.uploadAvatar);

module.exports = router;