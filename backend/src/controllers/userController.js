const { User } = require('../models');
const { supabase } = require('../config/supabase');

// Admin only: Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['supabase_uid'] },
    });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
};

// Admin only: Update user status
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.status = status;
    await user.save();

    res.json({ success: true, data: user, message: 'User status updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update user' });
  }
};

// Admin only: Delete a user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, error: 'Admin accounts cannot be deleted.' });
    }

    if (user.id === req.user.id) {
      return res.status(400).json({ success: false, error: 'You cannot delete your own account.' });
    }

    if (supabase) {
      await supabase.auth.admin.deleteUser(user.supabase_uid);
    }

    await user.destroy();
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete user' });
  }
};

module.exports = {
  getAllUsers,
  updateUserStatus,
  deleteUser,
};
