const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkColumns() {
  const { data, error } = await supabase.from('employees').select('*').limit(1);
  if (data && data[0]) {
    console.log("Employees Columns:", Object.keys(data[0]));
  }
  const { data: custData } = await supabase.from('customers').select('*').limit(1);
  if (custData && custData[0]) {
    console.log("Customers Columns:", Object.keys(custData[0]));
  }
}

checkColumns();
