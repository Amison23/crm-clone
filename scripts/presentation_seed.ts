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

async function seedPresentationData() {
  console.log("🚀 Starting Presentation Seed...");
  const allCompanyIds = Object.values(COMPANIES);

  // 1. Ensure Companies exist with proper data
  console.log("🏢 Seeding Companies...");
  await supabase.from('companies').upsert([
    { id: COMPANIES.CLOUDORA, name: 'Cloudora Technologies', pricing_tier: 'enterprise', is_active: true, website: 'https://cloudora.test' },
    { id: COMPANIES.MOMENTUM, name: 'Momentum Ventures', pricing_tier: 'pro', is_active: true, website: 'https://momentum.test' },
    { id: COMPANIES.STRATHMORE, name: 'Strathmore Academy', pricing_tier: 'starter', is_active: true, website: 'https://strathmore.test' }
  ]);

  // 2. Ensure Employees exist (More for each company)
  console.log("👥 Seeding Employees for all nodes...");
  const employeeList: any[] = [];
  const roles = ['admin', 'sales_agent', 'server_admin'];
  
  // Keep the main ones for consistency
  employeeList.push(
    { id: EMPLOYEES.SARAH_ATIENO, company_id: COMPANIES.CLOUDORA, full_name: 'Sarah Atieno', role: 'admin', email_address: 'sarah@cloudora.test' },
    { id: EMPLOYEES.KEVIN_KIP, company_id: COMPANIES.CLOUDORA, full_name: 'Kevin Kip', role: 'sales_agent', email_address: 'kevin@cloudora.test' },
    { id: EMPLOYEES.JASON_ANYANGO, company_id: COMPANIES.MOMENTUM, full_name: 'Jason Anyango', role: 'admin', email_address: 'jason@momentum.test' },
    { id: EMPLOYEES.TYEJA_ADMIN, company_id: COMPANIES.STRATHMORE, full_name: 'Tyeja Admin', role: 'superadmin', email_address: 'admin@strathmore.test' }
  );

  for (const cid of allCompanyIds) {
    for (let i = 0; i < 3; i++) {
      employeeList.push({
        id: `e-${cid.slice(0, 4)}-${i}`,
        company_id: cid,
        full_name: `${cid.slice(0, 4)} Staff ${i + 1}`,
        role: roles[i % 3],
        email_address: `staff${i}@${cid.slice(0, 4)}.test`
      });
    }
  }
  await supabase.from('employees').upsert(employeeList);

  // 3. Seed Customers for ALL companies
  console.log("🤝 Seeding Customers for all nodes...");
  const customerList: any[] = [];
  for (const cid of allCompanyIds) {
    customerList.push(
      { id: `c-${cid.slice(0, 4)}-1`, full_name: 'Alice Johnson', company_id: cid, email: 'alice@test.com' },
      { id: `c-${cid.slice(0, 4)}-2`, full_name: 'Bob Smith', company_id: cid, email: 'bob@test.com' },
      { id: `c-${cid.slice(0, 4)}-3`, full_name: 'Charlie Brown', company_id: cid, email: 'charlie@test.com' }
    );
  }
  await supabase.from('customers').upsert(customerList);

  // 4. Seed Tickets for ALL companies
  console.log("🎫 Seeding Tickets for all nodes...");
  await supabase.from('tickets').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const ticketList: any[] = [];
  for (const cid of allCompanyIds) {
    ticketList.push(
      { 
        company_id: cid, 
        client_id: `c-${cid.slice(0, 4)}-1`, 
        title: 'System performance lag', 
        description: 'The dashboard takes too long to load in the mornings.', 
        status: 'open', 
        priority: 'high',
        category: 'Technical'
      },
      { 
        company_id: cid, 
        client_id: `c-${cid.slice(0, 4)}-2`, 
        title: 'New feature request: PDF export', 
        description: 'We need to export reports to PDF.', 
        status: 'in_progress', 
        priority: 'medium',
        category: 'Feature Request'
      },
      { 
        company_id: cid, 
        client_id: `c-${cid.slice(0, 4)}-3`, 
        title: 'Wrong billing amount', 
        description: 'Last month we were overcharged by $10.', 
        status: 'closed', 
        priority: 'low',
        category: 'Billing'
      }
    );
  }
  await supabase.from('tickets').insert(ticketList);

  // 6. Seed Leads for ALL companies
  console.log("📈 Seeding Leads for all nodes...");
  await supabase.from('leads').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const leadList: any[] = [];
  const sources = ['LinkedIn', 'Referral', 'Web Search', 'Direct', 'Cold Call'];
  const statuses = ['new', 'contacted', 'qualified', 'won', 'lost'];
  
  for (const cid of allCompanyIds) {
    for (let i = 0; i < 15; i++) {
      leadList.push({
        company_id: cid,
        first_name: ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer'][i % 6],
        last_name: ['Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson', 'Martinez'][i % 6],
        phone: `+254700${100000 + i}`,
        status: statuses[i % 5],
        potential_value: 10000 + (i * 5000),
        company_name: `Enterprise ${i + 1} Node`,
        source: sources[i % 5]
      });
    }
  }
  const { data: insertedLeads } = await supabase.from('leads').insert(leadList).select();

  // 7. Seed Deals (from won leads)
  console.log("💰 Seeding Deals for won leads...");
  if (insertedLeads) {
    const wonLeads = insertedLeads.filter(l => l.status === 'won');
    const deals = wonLeads.map(l => ({
      company_id: l.company_id,
      lead_id: l.id,
      amount: l.potential_value,
      status: 'won'
    }));
    await supabase.from('deals').insert(deals);
  }

  // 8. Seed Tasks for ALL companies
  console.log("🛠️ Seeding Tasks for all nodes...");
  await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const taskList: any[] = [];
  for (const cid of allCompanyIds) {
    taskList.push(
      { company_id: cid, title: 'Quarterly Review', description: 'Prepare the quarterly performance slides.', status: 'pending', priority: 'high', due_date: new Date(Date.now() + 86400000 * 2).toISOString() },
      { company_id: cid, title: 'Call back key leads', description: 'Follow up with leads from the LinkedIn campaign.', status: 'in_progress', priority: 'medium', due_date: new Date().toISOString() },
      { company_id: cid, title: 'Update CRM guidelines', description: 'Internal document update for new agents.', status: 'completed', priority: 'low', due_date: new Date(Date.now() - 86400000).toISOString() }
    );
  }
  await supabase.from('tasks').insert(taskList);

  // 9. Seed Chat Sessions and Messages for ALL companies
  console.log("💬 Seeding Chat Sessions for all nodes...");
  await supabase.from('chat_sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const sessionList: any[] = [];
  for (const cid of allCompanyIds) {
    sessionList.push(
      { company_id: cid, customer_name: 'Visitor ' + cid.slice(0, 4), status: 'unassigned', source: 'landing_page' },
      { company_id: cid, customer_name: 'Lead ' + cid.slice(0, 4), status: 'active', source: 'crm' }
    );
  }
  const { data: sessions } = await supabase.from('chat_sessions').insert(sessionList).select();

  if (sessions) {
    console.log("📩 Seeding Chat Messages for all sessions...");
    await supabase.from('messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const messageList: any[] = [];
    for (const s of sessions) {
      messageList.push(
        { chat_session_id: s.id, company_id: s.company_id, content: 'Hi, I need help with my account.', role: 'user' },
        { chat_session_id: s.id, company_id: s.company_id, content: 'Sure, I can assist with that. What is the issue?', role: 'agent' }
      );
    }
    await supabase.from('messages').insert(messageList);
  }

  console.log("✅ Presentation Seed Completed Successfully.");
}

seedPresentationData().catch(err => {
  console.error("❌ Seed Failure:", err);
  process.exit(1);
});
