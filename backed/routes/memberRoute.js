const express = require('express');
const router = express.Router();
const memberController = require('../Controllers/memberController');

router.get('/showMember', memberController.showMember);
router.post('/updateMember', memberController.updateMember);
router.get('/showMyGroups', memberController.showMyGroups);
module.exports = router;