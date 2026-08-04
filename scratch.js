const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://rxjwpcxssfbkrpyerkqm.supabase.co', 'REDACTED_SERVICE_ROLE_KEY');

async function run() {
  // Query invite_codes table for that user's company to understand how they got superadmin
  const { data, error } = await supabase.from('invite_codes').select('*').limit(10);
  console.log('invite_codes:', JSON.stringify(data, null, 2));
  console.log('error:', error);
}
run();
