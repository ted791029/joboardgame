const express = require('express');
const router = express.Router();
const mailController = require('../Controllers/mailController');

router.get('/sendMail', mailController.sendMail);

module.exports = router;