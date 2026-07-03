const express = require('express');
const { getReceipt } = require('../controllers/receiptController');
const { verifyToken } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

const router = express.Router();

router.use(verifyToken);
router.use(roleCheck(['landlord', 'tenant', 'admin']));

router.get('/:paymentId', getReceipt);

module.exports = router;
