const express = require('express');
const { getPayments, getTenantPayments, initiateRentPayment, handleWebhook } = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

const router = express.Router();

// Webhook is public — use raw body so HMAC is computed over original bytes
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected routes
router.use(verifyToken);

router.get('/', roleCheck(['landlord', 'admin']), getPayments);
router.get('/tenant/:tenantId', roleCheck(['landlord', 'tenant', 'admin']), getTenantPayments);
router.post('/initiate', roleCheck(['landlord', 'tenant']), initiateRentPayment);

module.exports = router;
