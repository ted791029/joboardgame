const express = require('express');
const router = express.Router();
const groupController = require('../Controllers/groupController');

router.post('/create', groupController.create);
router.get('/joinGroup', groupController.joinGroup);
router.get('/quitGroup', groupController.quitGroup);
router.post('/updateGroup', groupController.updateGroup);
router.post('/applicationReply', groupController.applicationReply);

module.exports = router;