const express = require('express');
const { getMyProfile, getTenants, createTenant, getTenantById, updateTenant, assignRoom, vacateTenant, inviteTenant } = require('../controllers/tenantController');
const { verifyToken } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

const router = express.Router();

router.use(verifyToken);

// Tenant self-service (must come before the landlord/admin middleware)
router.get('/me', roleCheck(['tenant']), getMyProfile);

router.use(roleCheck(['landlord', 'admin']));

router.get('/', getTenants);
router.post('/', createTenant);
router.get('/:id', getTenantById);
router.patch('/:id', updateTenant);
router.post('/:id/assign-room', assignRoom);
router.post('/:id/vacate', vacateTenant);
router.post('/:id/invite', inviteTenant);

module.exports = router;
