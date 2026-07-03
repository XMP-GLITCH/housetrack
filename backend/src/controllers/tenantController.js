const { Tenant, Room, Payment, Property, User } = require('../models');
const { supabase } = require('../config/supabase');

const getMyProfile = async (req, res) => {
  try {
    // Prefer the most recent active record — a user can have old vacated records
    // sharing the same user_id if they were re-registered under the same email.
    const { Op } = require('sequelize');
    let tenant = await Tenant.findOne({
      where: { user_id: req.user.id, status: 'active' },
      include: [{ model: Room, include: [Property] }],
      order: [['id', 'DESC']],
    });
    // Fall back to any record (e.g. vacated) so tenant can still see their history
    if (!tenant) {
      tenant = await Tenant.findOne({
        where: { user_id: req.user.id },
        include: [{ model: Room, include: [Property] }],
        order: [['id', 'DESC']],
      });
    }
    if (!tenant) {
      return res.status(404).json({ success: false, error: 'Tenant profile not found. Contact your landlord.' });
    }
    res.json({ success: true, data: tenant });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
};

const getTenants = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const { Op } = require('sequelize');
    const where = { landlord_id: req.user.id };
    if (req.query.status) where.status = req.query.status;
    if (req.query.search) {
      where[Op.or] = [
        { full_name: { [Op.like]: `%${req.query.search}%` } },
        { phone: { [Op.like]: `%${req.query.search}%` } },
      ];
    }

    const { count, rows } = await Tenant.findAndCountAll({
      where,
      include: [{ model: Room, include: [Property] }],
      distinct: true,
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    res.json({ success: true, data: rows, meta: { total: count, page, limit, pages: Math.ceil(count / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch tenants' });
  }
};

const createTenant = async (req, res) => {
  try {
    const { full_name, phone, email, move_in_date, emergency_contact } = req.body;

    if (!full_name || !phone || !move_in_date) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const newTenant = await Tenant.create({
      landlord_id: req.user.id,
      full_name,
      phone,
      email,
      move_in_date,
      emergency_contact,
      status: 'active'
    });

    res.status(201).json({ success: true, data: newTenant, message: 'Tenant registered' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create tenant' });
  }
};

const getTenantById = async (req, res) => {
  try {
    const { id } = req.params;
    const tenant = await Tenant.findOne({
      where: { id, landlord_id: req.user.id },
      include: [
        { model: Room, include: [Property] },
        { model: Payment }
      ]
    });

    if (!tenant) {
      return res.status(404).json({ success: false, error: 'Tenant not found' });
    }

    res.json({ success: true, data: tenant });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch tenant' });
  }
};

const VALID_TENANT_STATUSES = ['active', 'vacated'];

const updateTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, phone, email, emergency_contact, status } = req.body;

    if (status !== undefined && !VALID_TENANT_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, error: `Invalid status. Allowed: ${VALID_TENANT_STATUSES.join(', ')}` });
    }

    const tenant = await Tenant.findOne({ where: { id, landlord_id: req.user.id } });
    if (!tenant) {
      return res.status(404).json({ success: false, error: 'Tenant not found' });
    }

    await tenant.update({ full_name, phone, email, emergency_contact, status });
    res.json({ success: true, data: tenant, message: 'Tenant updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update tenant' });
  }
};

const assignRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { room_id } = req.body;

    const tenant = await Tenant.findOne({ where: { id, landlord_id: req.user.id } });
    if (!tenant) {
      return res.status(404).json({ success: false, error: 'Tenant not found' });
    }

    const room = await Room.findByPk(room_id, { include: [Property] });
    if (!room || room.property.landlord_id !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Room not found' });
    }

    // Prevent occupying a room that belongs to a different tenant
    if (room.status === 'occupied' && String(tenant.room_id) !== String(room_id)) {
      return res.status(400).json({ success: false, error: 'Room is already occupied' });
    }

    // Free the tenant's previous room before moving them to the new one
    if (tenant.room_id && String(tenant.room_id) !== String(room_id)) {
      const previousRoom = await Room.findByPk(tenant.room_id);
      if (previousRoom) {
        previousRoom.status = 'available';
        await previousRoom.save();
      }
    }

    tenant.room_id = room.id;
    await tenant.save();

    room.status = 'occupied';
    await room.save();

    res.json({ success: true, message: 'Room assigned successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to assign room' });
  }
};

const vacateTenant = async (req, res) => {
  try {
    const { id } = req.params;

    const tenant = await Tenant.findOne({ where: { id, landlord_id: req.user.id } });
    if (!tenant) {
      return res.status(404).json({ success: false, error: 'Tenant not found' });
    }

    if (tenant.room_id) {
      const room = await Room.findByPk(tenant.room_id);
      if (room) {
        room.status = 'available';
        await room.save();
      }
    }

    tenant.status = 'vacated';
    tenant.room_id = null;
    tenant.user_id = null;
    await tenant.save();

    res.json({ success: true, message: 'Tenant vacated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to vacate tenant' });
  }
};

const inviteTenant = async (req, res) => {
  try {
    const { id } = req.params;

    const tenant = await Tenant.findOne({ where: { id, landlord_id: req.user.id } });
    if (!tenant) return res.status(404).json({ success: false, error: 'Tenant not found' });

    if (!tenant.email) {
      return res.status(400).json({ success: false, error: 'This tenant has no email address. Add one before sending an invite.' });
    }

    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Auth service not configured.' });
    }

    // Generate a login link — try invite first (creates user if new),
    // fall back to magic link if the email is already registered.
    let supabaseUserId = null;
    let loginLink = null;
    let isNewUser = false;

    let { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'invite',
      email: tenant.email,
      options: {
        data: { full_name: tenant.full_name },
        redirectTo: `${process.env.CLIENT_URL}/auth/callback`,
      },
    });

    if (linkError) {
      // User already exists in Supabase — generate a magic link instead
      const { data: mlData, error: mlError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: tenant.email,
        options: { redirectTo: `${process.env.CLIENT_URL}/auth/callback` },
      });
      if (mlError) return res.status(400).json({ success: false, error: mlError.message });
      linkData = mlData;
      isNewUser = false;
    } else {
      isNewUser = true;
    }

    supabaseUserId = linkData.user?.id;
    loginLink = linkData.properties?.action_link;

    if (!supabaseUserId) {
      return res.status(500).json({ success: false, error: 'Could not create auth account.' });
    }

    // Find or create the MySQL User record
    let localUser = await User.findOne({ where: { supabase_uid: supabaseUserId } });
    if (!localUser) {
      localUser = await User.create({
        supabase_uid: supabaseUserId,
        full_name: tenant.full_name,
        email: tenant.email,
        role: 'tenant',
        status: 'active',
      });
    }

    if (!tenant.user_id) {
      tenant.user_id = localUser.id;
      await tenant.save();
    }

    res.json({
      success: true,
      message: `Login link generated for ${tenant.email}`,
      loginLink: loginLink || null,
    });
  } catch (error) {
    console.error('Invite error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to send invite.' });
  }
};

module.exports = {
  getMyProfile,
  getTenants,
  createTenant,
  getTenantById,
  updateTenant,
  assignRoom,
  vacateTenant,
  inviteTenant
};
