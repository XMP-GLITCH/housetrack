const express = require('express');
const { registerLandlord, getMe, updateMe } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerLandlord);
router.post('/me', verifyToken, getMe);
router.patch('/me', verifyToken, updateMe);

module.exports = router;
