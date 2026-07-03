const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;

try {
  if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http')) {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized successfully.');
  } else {
    console.warn('⚠ Supabase credentials not configured. Auth features will not work until you set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  }
} catch (error) {
  console.warn('⚠ Failed to initialize Supabase client:', error.message);
}

module.exports = { supabase };
