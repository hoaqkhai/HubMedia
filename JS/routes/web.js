const express = require('express');
const router = express.Router();

// khai báo route
router.get('/', (req, res) => {
  res.send('Hello World!');
});

router.get('/', (req, res) => {
  const port = 3000; // ✅ Khai báo ở đây nếu cần
  res.send(`Server is running on port ${port}`);
});

module.exports = router;