const express = require('express');
const router = express.Router();
const menberRoute  = require('./memberRoute');
const authController = require('../Controllers/authController');
const mailRoute = require('./mailRoute');
const authRoute = require('./authRoute');
const uploadRoute = require('./uploadRoute');
const groupRoute = require('./groupRoute');
const visitorRoute = require('./visitorRoute');
const storeRoute = require('./storeRoute');
const messageRoute = require('./messageRoute');

router.use('/auth', authRoute);
router.use('/visit', visitorRoute);
router.use('/store', storeRoute);
router.use(authController.chenckToken);
router.use('/member', menberRoute);
router.use('/mail', mailRoute);
router.use('/upload', uploadRoute)
router.use('/group', groupRoute);
router.use('/message', messageRoute);

module.exports = router;
