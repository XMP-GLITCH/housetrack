/**
 * DEV ONLY — Reset all tenant auth accounts
 *
 * Deletes every tenant User row from MySQL, removes them from Supabase Auth,
 * and sets tenant.user_id back to null so invites can be re-sent fresh.
 *
 * Run: node scripts/reset-tenant-auth.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { sequelize } = require('../src/config/database');
require('../src/models/index');
const { User, Tenant } = require('../src/models');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  await sequelize.authenticate();
  console.log('✅ DB connected\n');

  // 1. Find all tenant MySQL users
  const tenantUsers = await User.findAll({ where: { role: 'tenant' } });
  console.log(`Found ${tenantUsers.length} tenant user(s) in MySQL:`);
  tenantUsers.forEach(u => console.log(`  • ${u.email} (id=${u.id}, supabase_uid=${u.supabase_uid})`));

  if (tenantUsers.length === 0) {
    console.log('\nNothing to reset.');
    process.exit(0);
  }

  // 2. Delete each from Supabase Auth
  console.log('\nDeleting from Supabase Auth...');
  for (const u of tenantUsers) {
    if (u.supabase_uid) {
      const { error } = await supabase.auth.admin.deleteUser(u.supabase_uid);
      if (error) {
        console.warn(`  ⚠ ${u.email}: ${error.message}`);
      } else {
        console.log(`  ✅ Deleted from Supabase: ${u.email}`);
      }
    }
  }

  // 3. Reset tenant.user_id to null
  console.log('\nResetting tenant.user_id...');
  const tenantUserIds = tenantUsers.map(u => u.id);
  const updated = await Tenant.update(
    { user_id: null },
    { where: { user_id: tenantUserIds } }
  );
  console.log(`  ✅ ${updated[0]} tenant row(s) unlinked`);

  // 4. Delete MySQL User rows
  console.log('\nDeleting from MySQL Users table...');
  const deleted = await User.destroy({ where: { role: 'tenant' } });
  console.log(`  ✅ ${deleted} user row(s) deleted`);

  console.log('\n✅ Reset complete. All tenant accounts wiped — you can re-send invites fresh.');
  process.exit(0);
}

run().catch(err => {
  console.error('Script failed:', err.message);
  process.exit(1);
});
