const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkTables() {
  const tables = ['employees', 'profiles', 'companies', 'leads', 'deals', 'tasks', 'tickets', 'customers'];
  for (const table of tables) {
    try {
      const { error: tableError } = await supabase.from(table).select('*').limit(1);
      if (tableError) {
        console.log(`❌ Table ${table} error:`, tableError.message);
      } else {
        console.log(`✅ Table ${table} exists`);
      }
    } catch (e) {
      console.log(`❌ Table ${table} catch error:`, e.message);
    }
  }
}

checkTables();
