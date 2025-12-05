const express = require('express');
<<<<<<< HEAD
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
=======
const { getHomepage } = require('../controllers/homeControllers');
const router = express.Router();

// Route trang chủ
router.get('/', getHomepage);


module.exports = router;
>>>>>>> 5247a51d76e8a77a7e757084e5f84ee459ae7d98
