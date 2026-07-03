const { Property, Room } = require('../models');

// Get all properties for a landlord
const getProperties = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const { count, rows } = await Property.findAndCountAll({
      where: { landlord_id: req.user.id },
      include: [{ model: Room }],
      distinct: true,
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    res.json({ success: true, data: rows, meta: { total: count, page, limit, pages: Math.ceil(count / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch properties' });
  }
};

// Create a new property
const createProperty = async (req, res) => {
  try {
    const { property_name, location, property_type, description } = req.body;

    if (!property_name || !location || !property_type) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const newProperty = await Property.create({
      landlord_id: req.user.id,
      property_name,
      location,
      property_type,
      description,
      status: 'active'
    });

    res.status(201).json({ success: true, data: newProperty, message: 'Property created' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create property' });
  }
};

// Get single property
const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findOne({
      where: { id, landlord_id: req.user.id },
      include: [{ model: Room }]
    });

    if (!property) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }

    res.json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch property' });
  }
};

// Update property
const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const property = await Property.findOne({ where: { id, landlord_id: req.user.id } });
    if (!property) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }

    const { property_name, location, property_type, description, status } = req.body;
    await property.update({ property_name, location, property_type, description, status });
    res.json({ success: true, data: property, message: 'Property updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update property' });
  }
};

// Delete property
const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    
    const property = await Property.findOne({ 
      where: { id, landlord_id: req.user.id },
      include: [{ model: Room }]
    });

    if (!property) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }

    // Check if any rooms are occupied
    const hasOccupiedRooms = property.rooms.some(room => room.status === 'occupied');
    if (hasOccupiedRooms) {
      return res.status(400).json({ success: false, error: 'Cannot delete property with occupied rooms' });
    }

    // Since rooms might still exist but be 'available', we should delete rooms first or cascade
    // Assuming we destroy them manually to be safe
    await Room.destroy({ where: { property_id: property.id } });
    await property.destroy();

    res.json({ success: true, message: 'Property deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete property' });
  }
};

module.exports = {
  getProperties,
  createProperty,
  getPropertyById,
  updateProperty,
  deleteProperty
};
