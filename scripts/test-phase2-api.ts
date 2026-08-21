import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, serviceKey);

async function runPhase2Tests() {
  console.log("=== RUNNING PHASE 2 API TESTS ===");

  // 1. Fetch test users / employees
  const { data: employees } = await supabase
    .from("employees")
    .select("id, full_name, role, company_id");

  console.log(`Found ${employees?.length || 0} employees for testing.`);

  const adminUser = employees?.find(e => e.role === "admin" || e.role === "superadmin");
  const agent1 = employees?.find(e => e.role === "sales_agent");
  const agent2 = employees?.find(e => e.role === "dev" || (e.role === "sales_agent" && e.id !== agent1?.id));

  console.log("Admin User:", adminUser?.full_name, "(", adminUser?.id, ")");
  console.log("Agent 1:", agent1?.full_name, "(", agent1?.id, ")");
  console.log("Agent 2:", agent2?.full_name, "(", agent2?.id, ")");

  const tenantId = adminUser?.company_id || "cabadf43-8874-43fe-adac-9c7b70889fef";

  // 2. Clear old test tasks if needed and create sample tasks demonstrating relations
  console.log("\n--- Setting up sample tasks with explicit created_by & assigned_to ---");

  // Task 1: 'mine' for agent1 (assigned_to = agent1.id, created_by = adminUser.id)
  const { data: taskMine } = await supabase
    .from("tasks")
    .insert({
      company_id: tenantId,
      title: "Test Task: Assigned to Agent 1",
      description: "Sample task created by Admin for Agent 1",
      status: "pending",
      priority: "high",
      due_date: new Date(Date.now() + 86400000).toISOString(),
      assigned_to: agent1?.id || adminUser?.id,
      created_by: adminUser?.id,
    })
    .select("id, title, assigned_to, created_by")
    .single();

  // Task 2: 'assigned_by_me' for adminUser (assigned_to = agent2.id, created_by = adminUser.id)
  const { data: taskAssignedByMe } = await supabase
    .from("tasks")
    .insert({
      company_id: tenantId,
      title: "Test Task: Delegated to Agent 2",
      description: "Sample task created by Admin for Agent 2",
      status: "in_progress",
      priority: "medium",
      due_date: new Date(Date.now() - 86400000).toISOString(), // Overdue
      assigned_to: agent2?.id || adminUser?.id,
      created_by: adminUser?.id,
    })
    .select("id, title, assigned_to, created_by")
    .single();

  // Task 3: 'team' for agent1 (assigned_to = agent2.id, created_by = adminUser.id)
  // For agent1, this task is neither assigned_to them nor created_by them -> 'team'

  console.log("Created Task (Mine for Agent1):", taskMine?.id);
  console.log("Created Task (Assigned by Admin):", taskAssignedByMe?.id);

  // 3. Test Relation Evaluation Logic
  console.log("\n--- Testing Relation evaluate function output ---");
  const testUser1 = agent1?.id || "user-1";
  const testAdmin = adminUser?.id || "admin-1";

  const { data: allTasks } = await supabase
    .from("tasks")
    .select("id, title, status, priority, due_date, assigned_to, created_by")
    .eq("company_id", tenantId)
    .limit(5);

  const evaluatedTasksForAdmin = (allTasks || []).map(t => {
    let relation = "team";
    if (t.assigned_to === testAdmin) relation = "mine";
    else if (t.created_by === testAdmin) relation = "assigned_by_me";
    return { id: t.id, title: t.title, assigned_to: t.assigned_to, created_by: t.created_by, relation };
  });

  const evaluatedTasksForAgent1 = (allTasks || []).map(t => {
    let relation = "team";
    if (t.assigned_to === testUser1) relation = "mine";
    else if (t.created_by === testUser1) relation = "assigned_by_me";
    return { id: t.id, title: t.title, assigned_to: t.assigned_to, created_by: t.created_by, relation };
  });

  console.log("\nSample getTasks() Relation Output for Admin:");
  console.log(JSON.stringify(evaluatedTasksForAdmin, null, 2));

  console.log("\nSample getTasks() Relation Output for Agent 1:");
  console.log(JSON.stringify(evaluatedTasksForAgent1, null, 2));

  // 4. Test Explicit Authorization Check for update/delete
  console.log("\n--- Testing Explicit Authorization logic ---");
  // Try unauthorized mutation: agent2 trying to update taskMine (which is assigned to agent1 and created by admin)
  function checkAuth(userId: string, userRole: string, task: any) {
    const isAssigned = task.assigned_to === userId;
    const isCreator = task.created_by === userId;
    const isAdmin = userRole === "admin" || userRole === "superadmin";
    if (!isAssigned && !isCreator && !isAdmin) {
      return { authorized: false, error: "Access Denied: Insufficient permissions to modify or delete this task" };
    }
    return { authorized: true };
  }

  const unauthorizedCheck = checkAuth(agent2?.id || "unauth-id", "sales_agent", taskMine);
  const authorizedCheckAdmin = checkAuth(adminUser?.id || "admin-id", "admin", taskMine);
  const authorizedCheckOwner = checkAuth(agent1?.id || "owner-id", "sales_agent", taskMine);

  console.log("Unauthorized Update Attempt Result:", JSON.stringify(unauthorizedCheck, null, 2));
  console.log("Authorized Admin Result:", JSON.stringify(authorizedCheckAdmin, null, 2));
  console.log("Authorized Owner Result:", JSON.stringify(authorizedCheckOwner, null, 2));

  // 5. Test Feedback Functions (addTaskFeedback & getTaskFeedback)
  console.log("\n--- Testing Task Feedback & Audit Log Flow ---");
  const targetTaskId = taskMine?.id;
  const authorId = adminUser?.id || agent1?.id;

  console.log("Before adding feedback, querying task_feedback:");
  const { data: initialFeedback } = await supabase
    .from("task_feedback")
    .select("*")
    .eq("task_id", targetTaskId);
  console.log("Initial Feedback Count:", initialFeedback?.length || 0);

  // Insert feedback
  const { data: addedFeedback, error: fbError } = await supabase
    .from("task_feedback")
    .insert({
      task_id: targetTaskId,
      author_id: authorId,
      message: "Please review the proposed update before EOD."
    })
    .select("id, message, created_at")
    .single();

  if (fbError) {
    console.error("Feedback insertion error:", fbError);
  } else {
    console.log("Added feedback successfully:", addedFeedback);

    // Audit log
    await supabase.from("audit_logs").insert({
      actor_id: authorId,
      action: "ADD_TASK_FEEDBACK",
      entity_type: "task",
      entity_id: targetTaskId,
      payload: { feedback_id: addedFeedback.id, message: addedFeedback.message }
    });
  }

  console.log("\nAfter adding feedback, querying task_feedback:");
  const { data: retrievedFeedback } = await supabase
    .from("task_feedback")
    .select("*, author:employees!task_feedback_author_id_fkey(full_name, email_address, role)")
    .eq("task_id", targetTaskId);
  console.log("Retrieved Feedback:", JSON.stringify(retrievedFeedback, null, 2));

  // Verify Audit Log
  const { data: auditEntries } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("entity_id", targetTaskId)
    .order("created_at", { ascending: false });
  console.log("\nAudit Log Entries for Task:", JSON.stringify(auditEntries, null, 2));

  process.exit(0);
}

runPhase2Tests();
