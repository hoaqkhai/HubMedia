const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/login', authController.getLoginPage);
router.post('/login', authController.postLogin);
router.get('/logout', authController.logout);
router.get('/me', authController.me);
router.post("/register", authController.postRegister);

module.exports = router;
