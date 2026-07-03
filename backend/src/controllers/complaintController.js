const { Complaint, Tenant, Room, Property } = require('../models');

const getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.findAll({
      where: { landlord_id: req.user.id },
      include: [
        { model: Tenant },
        { model: Room, include: [Property] }
      ]
    });
    res.json({ success: true, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch complaints' });
  }
};

const getTenantComplaints = async (req, res) => {
  try {
    const { tenantId } = req.params;

    if (req.user.role === 'tenant') {
      const currentTenant = await Tenant.findOne({
        where: { user_id: req.user.id, status: 'active' },
        order: [['id', 'DESC']],
      });
      if (!currentTenant || Number(currentTenant.id) !== Number(tenantId)) {
        return res.status(403).json({ success: false, error: 'Forbidden' });
      }
    } else if (req.user.role === 'landlord') {
      const tenant = await Tenant.findOne({ where: { id: tenantId, landlord_id: req.user.id } });
      if (!tenant) {
        return res.status(404).json({ success: false, error: 'Tenant not found' });
      }
    }

    const complaints = await Complaint.findAll({
      where: { tenant_id: tenantId },
      include: [{ model: Room, include: [Property] }]
    });

    res.json({ success: true, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch tenant complaints' });
  }
};

const createComplaint = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const currentTenant = await Tenant.findOne({
      where: { user_id: req.user.id, status: 'active' },
      order: [['id', 'DESC']],
    });
    if (!currentTenant || !currentTenant.room_id) {
      return res.status(400).json({ success: false, error: 'You are not assigned to a room' });
    }

    const newComplaint = await Complaint.create({
      tenant_id: currentTenant.id,
      room_id: currentTenant.room_id,
      landlord_id: currentTenant.landlord_id,
      title,
      description,
      category,
      status: 'pending'
    });

    res.status(201).json({ success: true, data: newComplaint, message: 'Complaint submitted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create complaint' });
  }
};

const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'in_progress', 'resolved'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const complaint = await Complaint.findOne({ where: { id, landlord_id: req.user.id } });
    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }

    // Status can only move forward
    const statusOrder = { 'pending': 0, 'in_progress': 1, 'resolved': 2 };
    if (statusOrder[status] < statusOrder[complaint.status]) {
      return res.status(400).json({ success: false, error: 'Status can only move forward' });
    }

    complaint.status = status;
    await complaint.save();

    res.json({ success: true, data: complaint, message: 'Complaint status updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update complaint' });
  }
};

module.exports = {
  getComplaints,
  getTenantComplaints,
  createComplaint,
  updateComplaintStatus
};
