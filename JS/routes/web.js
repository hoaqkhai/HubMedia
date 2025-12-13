const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const path = require("path");

// Trang chủ
router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Trang riêng tư
router.get('/dashboard', authMiddleware, (req, res) => {
    res.render('dashboard.ejs', { user: req.session.user });
});

module.exports = router;
