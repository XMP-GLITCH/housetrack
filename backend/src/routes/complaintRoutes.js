const express = require('express');
const { getComplaints, getTenantComplaints, createComplaint, updateComplaintStatus } = require('../controllers/complaintController');
const { verifyToken } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

const router = express.Router();

router.use(verifyToken);

router.get('/', roleCheck(['landlord', 'admin']), getComplaints);
router.get('/tenant/:tenantId', roleCheck(['landlord', 'tenant', 'admin']), getTenantComplaints);
router.post('/', roleCheck(['tenant']), createComplaint);
router.patch('/:id/status', roleCheck(['landlord', 'admin']), updateComplaintStatus);

module.exports = router;
