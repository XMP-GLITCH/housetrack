const { Room, Property } = require('../models');

// Get all rooms for a property
const getRooms = async (req, res) => {
  try {
    const { propertyId } = req.params;

    // Verify landlord owns the property
    const property = await Property.findOne({ where: { id: propertyId, landlord_id: req.user.id } });
    if (!property) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }

    const rooms = await Room.findAll({ where: { property_id: propertyId } });
    res.json({ success: true, data: rooms });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch rooms' });
  }
};

// Add room to a property
const createRoom = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { room_number, room_type, rent_amount } = req.body;

    if (!room_number || !room_type || !rent_amount) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const property = await Property.findOne({ where: { id: propertyId, landlord_id: req.user.id } });
    if (!property) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }

    const newRoom = await Room.create({
      property_id: propertyId,
      room_number,
      room_type,
      rent_amount,
      status: 'available'
    });

    res.status(201).json({ success: true, data: newRoom, message: 'Room created' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create room' });
  }
};

// Update room
const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const room = await Room.findByPk(id, { include: [{ model: Property }] });
    
    if (!room || room.property.landlord_id !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Room not found' });
    }

    const { room_number, room_type, rent_amount, status } = req.body;
    await room.update({ room_number, room_type, rent_amount, status });
    res.json({ success: true, data: room, message: 'Room updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update room' });
  }
};

// Delete room
const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    
    const room = await Room.findByPk(id, { include: [{ model: Property }] });
    
    if (!room || room.property.landlord_id !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Room not found' });
    }

    if (room.status === 'occupied') {
      return res.status(400).json({ success: false, error: 'Cannot delete an occupied room' });
    }

    await room.destroy();
    res.json({ success: true, message: 'Room deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete room' });
  }
};

module.exports = {
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom
};
