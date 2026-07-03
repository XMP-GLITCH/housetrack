const express = require('express');
const { getAllUsers, updateUserStatus, deleteUser } = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

const router = express.Router();

router.use(verifyToken);
router.use(roleCheck(['admin']));

router.get('/', getAllUsers);
router.patch('/:id/status', updateUserStatus);
router.delete('/:id', deleteUser);

module.exports = router;
