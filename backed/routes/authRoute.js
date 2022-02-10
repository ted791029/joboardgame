const express = require('express');
const router = express.Router();
const authContronller = require('../Controllers/authController');

router.post('/register', authContronller.register);
router.post('/login', authContronller.login);
router.get('/test', (req, res) => {
    res.send('test');
})
router.get('/verify', authContronller.verify);
router.post('/forget', authContronller.forget);
router.post('/rePassword', authContronller.rePassword);
router.post('/fbLogin', authContronller.fbLogin);

module.exports = router;