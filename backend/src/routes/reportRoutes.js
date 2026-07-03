const express = require('express');
const { getLandlordSummary, getAdminSummary } = require('../controllers/reportController');
const { verifyToken } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

const router = express.Router();

router.use(verifyToken);

router.get('/summary', roleCheck(['landlord']), getLandlordSummary);
router.get('/admin-summary', roleCheck(['admin']), getAdminSummary);

module.exports = router;
