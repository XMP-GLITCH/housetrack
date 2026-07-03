const express = require('express');
const { getRooms, createRoom, updateRoom, deleteRoom } = require('../controllers/roomController');
const { verifyToken } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

const router = express.Router();

router.use(verifyToken);
router.use(roleCheck(['landlord', 'admin']));

// Room routes specific to a property
router.get('/property/:propertyId', getRooms);
router.post('/property/:propertyId', createRoom);

// General room routes
router.patch('/:id', updateRoom);
router.delete('/:id', deleteRoom);

module.exports = router;
