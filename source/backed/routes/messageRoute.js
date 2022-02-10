const express = require('express');
const router = express.Router();

const messageController = require('../Controllers/messageController');

router.get('/record', messageController.record);
router.get('/msg', messageController.msg);

module.exports = router;