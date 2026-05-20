import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function checkTables() {
  const { data, error } = await supabase.rpc('get_tables'); // If this RPC exists
  if (error) {
    // Try listing some known tables
    const tables = ['employees', 'profiles', 'companies', 'leads', 'deals', 'tasks', 'tickets', 'customers'];
    for (const table of tables) {
      const { error: tableError } = await supabase.from(table).select('*').limit(1);
      if (tableError) {
        console.log(`❌ Table ${table} error:`, tableError.message);
      } else {
        console.log(`✅ Table ${table} exists`);
      }
    }
  } else {
    console.log("Tables:", data);
  }
}

checkTables();
