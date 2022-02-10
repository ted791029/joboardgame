const express = require('express');
const router = express.Router();
const storeController = require('../Controllers/storeController');

router.get('/getAllStore', storeController.getAllStore);
router.post('/getDistStore', storeController.getDistStore);
router.post('./delStore', storeController.delStore);
module.exports = router;