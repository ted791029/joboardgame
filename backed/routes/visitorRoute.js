const express = require('express');
const router = express.Router();
const visitorController = require('../Controllers/visitorController');

router.get('/findGroup', visitorController.findGroup);
router.get('/search', visitorController.search);
router.post('/webFindGroup', visitorController.webFindGroup);
router.post('/webSearch', visitorController.webSearch);
router.get('/showGroup', visitorController.showGroup);


module.exports = router;