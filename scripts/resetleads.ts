import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Safety Check
if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Error: Environment variables not found in .env.local");
  process.exit(1);
}

// Service Role Key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseKey);

const TENANT_ID = "cabadf43-8874-43fe-adac-9c7b70889fef";

async function resetLeadsOnly() {
  console.log("🧹 Initializing Lead Reset Protocol...");

  // Update EVERY lead in this workspace to be completely unassigned
  const { error } = await supabase
    .from('leads')
    .update({ 
      employee_id: null, 
      status: 'new' 
    })
    .eq('company_id', TENANT_ID);

  if (error) {
    console.error("❌ Error resetting leads:", error.message);
    return;
  }

  console.log("✅ Success! All leads have been stripped of their agents and returned to the Unassigned Queue.");
}

resetLeadsOnly();