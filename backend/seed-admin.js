require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { sequelize } = require('./src/config/database');
require('./src/models/index');
const User = require('./src/models/User');

const ADMIN_EMAIL    = 'admin@housetrack.app';
const ADMIN_PASSWORD = 'Admin@1234';
const ADMIN_NAME     = 'HouseTrack Admin';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const run = async () => {
  await sequelize.authenticate();
  console.log('✅ DB connected');

  // 1 — create or retrieve Supabase user
  let supabaseUid;
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
  });

  if (createErr) {
    if (createErr.message?.toLowerCase().includes('already registered') || createErr.code === 'email_exists') {
      // user already exists in Supabase — look up their uid
      const { data: list } = await supabase.auth.admin.listUsers();
      const existing = list?.users?.find(u => u.email === ADMIN_EMAIL);
      if (!existing) { console.error('Could not find existing Supabase user.'); process.exit(1); }
      supabaseUid = existing.id;
      console.log('ℹ️  Supabase user already exists, uid:', supabaseUid);
    } else {
      console.error('Supabase error:', createErr.message);
      process.exit(1);
    }
  } else {
    supabaseUid = created.user.id;
    console.log('✅ Supabase user created, uid:', supabaseUid);
  }

  // 2 — upsert MySQL user record
  const [user, wasCreated] = await User.findOrCreate({
    where: { email: ADMIN_EMAIL },
    defaults: {
      supabase_uid: supabaseUid,
      full_name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      role: 'admin',
      status: 'active',
    },
  });

  if (!wasCreated) {
    // ensure role is admin
    await user.update({ role: 'admin', status: 'active', supabase_uid: supabaseUid });
    console.log('ℹ️  Existing DB user updated to admin.');
  } else {
    console.log('✅ Admin user created in DB.');
  }

  console.log('\n─────────────────────────────');
  console.log('  Admin login credentials');
  console.log('─────────────────────────────');
  console.log('  Email   :', ADMIN_EMAIL);
  console.log('  Password:', ADMIN_PASSWORD);
  console.log('  URL     : http://localhost:5173/login');
  console.log('─────────────────────────────\n');

  await sequelize.close();
};

run().catch(err => { console.error(err); process.exit(1); });
