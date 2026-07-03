const express = require('express');
const { getProperties, createProperty, getPropertyById, updateProperty, deleteProperty } = require('../controllers/propertyController');
const { verifyToken } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

const router = express.Router();

router.use(verifyToken);
router.use(roleCheck(['landlord', 'admin']));

router.get('/', getProperties);
router.post('/', createProperty);
router.get('/:id', getPropertyById);
router.patch('/:id', updateProperty);
router.delete('/:id', deleteProperty);

module.exports = router;
