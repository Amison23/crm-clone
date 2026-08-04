const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://rxjwpcxssfbkrpyerkqm.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4andwY3hzc2Zia3JweWVya3FtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzczNjM3MiwiZXhwIjoyMDg5MzEyMzcyfQ.DidxRU03hAPZx3LeeHa3DUUr6MV1ClOQ5CbPp6k2pB4');

async function run() {
  // Query invite_codes table for that user's company to understand how they got superadmin
  const { data, error } = await supabase.from('invite_codes').select('*').limit(10);
  console.log('invite_codes:', JSON.stringify(data, null, 2));
  console.log('error:', error);
}
run();
