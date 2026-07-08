const { supabase } = require('../config/supabase');
const { User } = require('../models');



const registerLandlord = async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Authentication service not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env' });
    }

    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Create the user in Supabase, pre-confirmed, so they can sign in immediately
    // without an email-confirmation round-trip (Supabase's built-in mailer is
    // rate-limited and unreliable). Uses the service-role key (admin API).
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });

    if (authError) {
      return res.status(400).json({ success: false, error: authError.message });
    }

    // Check if user is created successfully in auth
    const supabase_uid = authData.user?.id;
    if (!supabase_uid) {
      return res.status(500).json({ success: false, error: 'Failed to create user in auth provider' });
    }

    // Create user in our database
    const newUser = await User.create({
      supabase_uid,
      full_name,
      email,
      role: 'landlord',
      status: 'active',
    });

    res.status(201).json({ success: true, data: newUser, message: 'Landlord registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Internal server error during registration' });
  }
};

const getMe = async (req, res) => {
  try {
    // req.user is populated by verifyToken middleware
    res.json({ success: true, data: req.user });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

const updateMe = async (req, res) => {
  try {
    const { full_name } = req.body;
    if (!full_name || !full_name.trim()) {
      return res.status(400).json({ success: false, error: 'Name is required.' });
    }
    const { User } = require('../models');
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found.' });
    await user.update({ full_name: full_name.trim() });
    res.json({ success: true, data: user, message: 'Profile updated.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update profile.' });
  }
};

module.exports = {
  registerLandlord,
  getMe,
  updateMe,
};
