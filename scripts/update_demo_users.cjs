const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rxjwpcxssfbkrpyerkqm.supabase.co';
const serviceRoleKey = 'REDACTED_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, serviceRoleKey);

const COMPANY_ID = '16c037ab-aa7d-4277-b0e3-0bee215cb935'; // Cloudora Testing INC

const usersToUpdate = [
  { email: 'hanspajero2@gmail.com', role: 'dev', company_id: COMPANY_ID, full_name: 'Hans Dev' },
  { email: 'amison011@gmail.com', role: 'sales_agent', company_id: COMPANY_ID, full_name: 'Amison Sales' },
  { email: 'mbuguavictor46@gmail.com', role: 'admin', company_id: COMPANY_ID, full_name: 'Victor Admin' },
  { email: 'mbuguavictor1@gmail.com', role: 'superadmin', company_id: COMPANY_ID, full_name: 'Victor Superadmin' },
];

async function updateUsers() {
  console.log("Updating demo employee accounts...");

  for (const u of usersToUpdate) {
    const { data, error } = await supabase
      .from('employees')
      .update({
        role: u.role,
        company_id: u.company_id,
        full_name: u.full_name,
        updated_at: new Date().toISOString()
      })
      .ilike('email_address', u.email)
      .select();

    if (error) {
      console.error(`Failed to update ${u.email}:`, error.message);
    } else {
      console.log(`Updated ${u.email}:`, data);
    }
  }

  // Also verify all 4 employees
  const { data: finalEmployees, error: fetchErr } = await supabase
    .from('employees')
    .select('id, email_address, full_name, role, company_id')
    .in('email_address', usersToUpdate.map(u => u.email));

  console.log("\nVerified Employee Records:");
  console.log(JSON.stringify(finalEmployees, null, 2));
}

updateUsers();
