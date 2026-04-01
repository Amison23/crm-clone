import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Credentials missing in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// --- IDENTITY MAPPING (From your SQL) ---
const COMPANIES = {
  STRATHMORE: '00000000-0000-0000-0000-000000000001',
  MOMENTUM: 'c2b4fc9e-b23e-450a-9f33-0edca935d1ac',
  CLOUDORA: 'cabadf43-8874-43fe-adac-9c7b70889fef'
};

const EMPLOYEES = {
  SARAH_ATIENO: 'e2a7f569-6bb6-4985-9d5f-85b296c3e665', // Cloudora
  KEVIN_KIP: '2b7a45b1-c6c6-459b-8612-9db545e790b1',    // Cloudora
  JASON_ANYANGO: 'e784d137-78e9-4e45-9783-c5f3b8f41f26', // Momentum
  TYEJA_ADMIN: '0cfd7601-c671-4368-86e5-23d8db4ffca3'   // Strathmore
};

async function seedIntelligence() {
  console.log("🧨 Phase 1: Cleaning existing analytics data...");
  
  // Delete in order to respect FK constraints
  await supabase.from('deals').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('tickets').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('leads').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('analytics_snapshots').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log("📊 Phase 2: Generating 30-Day History for Cloudora...");
  const snapshots = Array.from({ length: 30 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return {
      tenant_id: COMPANIES.CLOUDORA,
      recorded_at: date.toISOString().split('T')[0],
      leads_count: Math.floor(Math.random() * 20) + 40,
      conversion_rate: parseFloat((Math.random() * 8 + 22).toFixed(2)),
      tasks_completed_count: Math.floor(Math.random() * 10) + 5
    };
  });
  await supabase.from('analytics_snapshots').insert(snapshots);

  console.log("📈 Phase 3: Seeding Leads (with NOT NULL phone validation)...");
  const leads = [
    // Sarah's Leads @ Cloudora
    { id: '980d0a82-d8a8-4094-8144-0f0a61c18d86', company_id: COMPANIES.CLOUDORA, employee_id: EMPLOYEES.SARAH_ATIENO, first_name: 'Elite', last_name: 'Prospect A', phone: '+254711223344', status: 'won', potential_value: 39624.39, company_name: 'Safaricom' },
    { id: '06532b9b-18b5-40c0-b3b0-9ba9db1ce53a', company_id: COMPANIES.CLOUDORA, employee_id: EMPLOYEES.SARAH_ATIENO, first_name: 'Elite', last_name: 'Prospect B', phone: '+254711223345', status: 'won', potential_value: 24712.68, company_name: 'KCB Bank' },
    
    // Kevin's Leads @ Cloudora
    { id: '39c430b4-83b2-4abc-b72b-a5fde06f3480', company_id: COMPANIES.CLOUDORA, employee_id: EMPLOYEES.KEVIN_KIP, first_name: 'Junior', last_name: 'Lead X', phone: '+254711223346', status: 'lost', potential_value: 3534.14, company_name: 'Zuku' },
    { id: '0eb20dc3-26ff-4427-b7af-66e57f3161c3', company_id: COMPANIES.CLOUDORA, employee_id: EMPLOYEES.KEVIN_KIP, first_name: 'Junior', last_name: 'Lead Y', phone: '+254711223347', status: 'won', potential_value: 16754.65, company_name: 'Little Cab' },

    // Jason's Leads @ Momentum
    { company_id: COMPANIES.MOMENTUM, employee_id: EMPLOYEES.JASON_ANYANGO, first_name: 'Momentum', last_name: 'Lead', phone: '+254722000111', status: 'won', potential_value: 88000.00, company_name: 'Jumia' },

    // Unassigned (Warning Queue)
    { company_id: COMPANIES.CLOUDORA, employee_id: null, first_name: 'Ghost', last_name: 'Operator', phone: '+254799000999', status: 'new', potential_value: 50000.00, company_name: 'Void Corp' }
  ];

  const { data: insertedLeads } = await supabase.from('leads').insert(leads).select();

  console.log("💰 Phase 4: Validating Deals...");
  if (insertedLeads) {
    const wonLeads = insertedLeads.filter(l => l.status === 'won');
    const deals = wonLeads.map(l => ({
      company_id: l.company_id,
      lead_id: l.id,
      assigned_to: l.employee_id,
      amount: l.potential_value,
      status: 'won'
    }));
    await supabase.from('deals').insert(deals);
  }

  console.log("🛠️ Phase 5: Aligning Tasks...");
  const tasks = [
    { company_id: COMPANIES.CLOUDORA, assigned_to: EMPLOYEES.SARAH_ATIENO, title: 'Finalize Enterprise Contract', due_date: new Date().toISOString(), status: 'pending' },
    { company_id: COMPANIES.CLOUDORA, assigned_to: EMPLOYEES.KEVIN_KIP, title: 'Follow-up Call', due_date: new Date().toISOString(), status: 'completed' }
  ];
  await supabase.from('tasks').insert(tasks);

  console.log("✅ Seed Operation Successful.");
}

seedIntelligence().catch(err => console.error("❌ Critical Seed Failure:", err));