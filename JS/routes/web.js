const express = require('express');
const { getHomepage } = require('../controllers/homeControllers');
const router = express.Router();

// Route trang chủ
router.get('/', getHomepage);


module.exports = router;
