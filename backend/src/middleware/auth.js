const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');
const { User, Tenant } = require('../models');

const verifyToken = async (req, res, next) => {
  if (!supabase) {
    return res.status(503).json({ success: false, error: 'Authentication service not configured' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    let supabaseUid = null;
    let userEmail = null;

    // Fast path: verify JWT locally using SUPABASE_JWT_SECRET (no network call)
    if (process.env.SUPABASE_JWT_SECRET) {
      try {
        const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
        supabaseUid = decoded.sub;
        userEmail = decoded.email;
      } catch (jwtErr) {
        return res.status(401).json({ success: false, error: 'Unauthorized: Invalid token' });
      }
    } else {
      // Fallback: verify via Supabase network call
      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized: Invalid token' });
      }
      supabaseUid = data.user.id;
      userEmail = data.user.email;
      req.supabaseUser = data.user;
    }

    // Look up MySQL user — only active accounts may proceed
    let localUser = await User.findOne({ where: { supabase_uid: supabaseUid, status: 'active' } });

    if (!localUser) {
      // Block suspended users before the recovery path can create a fresh active record
      const anyUser = await User.findOne({ where: { supabase_uid: supabaseUid } });
      if (anyUser) {
        return res.status(403).json({ success: false, error: 'Account suspended. Contact your administrator.' });
      }
    }

    // Recovery: Supabase user exists but MySQL record was never created (e.g. DB was
    // down when the invite was sent). If a Tenant row matches by email, auto-complete.
    if (!localUser && userEmail) {
      const tenant = await Tenant.findOne({ where: { email: userEmail } });
      if (tenant) {
        localUser = await User.create({
          supabase_uid: supabaseUid,
          full_name: tenant.full_name,
          email: userEmail,
          role: 'tenant',
          status: 'active',
        });
        if (!tenant.user_id) {
          tenant.user_id = localUser.id;
          await tenant.save();
        }
      } else {
        return res.status(401).json({ success: false, error: 'Unauthorized: User not found in database' });
      }
    } else if (!localUser) {
      return res.status(401).json({ success: false, error: 'Unauthorized: User not found in database' });
    }

    req.user = localUser;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    if (err.code === 'ECONNRESET' || err.code === 'ENOTFOUND' || err.message?.includes('fetch failed')) {
      return res.status(503).json({ success: false, error: 'Auth service temporarily unreachable. Please retry.' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error during authentication' });
  }
};

module.exports = { verifyToken };
