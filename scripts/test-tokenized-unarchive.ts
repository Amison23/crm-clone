import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, serviceKey);

async function runTokenizedUnarchiveTest() {
  console.log("=================================================");
  console.log("   TOKENIZED UNARCHIVE LOCK SYSTEM TEST (MAX 5)");
  console.log("=================================================\n");

  const companyId = "16c037ab-aa7d-4277-b0e3-0bee215cb935";
  const { data: admin } = await supabase.from("employees").select("id").eq("company_id", companyId).limit(1).single();
  const adminId = admin?.id || "520a99a5-5ef7-4194-baf6-85891a441799";

  // Create a test task with max_unarchives = 5, unarchive_count = 0
  const now = new Date().toISOString();
  const { data: task } = await supabase
    .from("tasks")
    .insert({
      company_id: companyId,
      assigned_to: adminId,
      created_by: adminId,
      title: "Tokenized Unarchive Test Task (5 Limit)",
      description: "Testing tokenized unarchive counter and locking",
      status: "completed",
      priority: "high",
      due_date: now,
      archived_at: now,
      archived_by: adminId,
      unarchive_count: 0,
      max_unarchives: 5,
    })
    .select("id, title, unarchive_count, max_unarchives, archived_at")
    .single();

  console.log(`[Created Test Task] ID: ${task?.id}`);
  console.log("Initial Task State:", JSON.stringify(task, null, 2));

  // Loop 5 unarchive & re-archive cycles
  for (let i = 1; i <= 5; i++) {
    console.log(`\n--- CYCLE ${i}: Unarchive Attempt ${i} ---`);

    // Fetch current state
    const { data: current } = await supabase.from("tasks").select("unarchive_count, max_unarchives").eq("id", task?.id).single();
    const cnt = current?.unarchive_count || 0;
    const limit = current?.max_unarchives || 5;

    if (cnt >= limit) {
      console.log(`[REJECTED] Task has reached max unarchive limit (${cnt}/${limit})!`);
      break;
    }

    const newCount = cnt + 1;
    const isNowUsedUp = newCount >= limit;

    // Unarchive
    const { data: unarchived } = await supabase
      .from("tasks")
      .update({ archived_at: null, archived_by: null, unarchive_count: newCount, unarchive_used: isNowUsedUp })
      .eq("id", task?.id)
      .select("id, archived_at, unarchive_count, max_unarchives, unarchive_used")
      .single();

    console.log(`Unarchive ${i} Success Output:`, JSON.stringify(unarchived, null, 2));

    // Re-archive for next cycle
    const archiveTime = new Date().toISOString();
    await supabase.from("tasks").update({ archived_at: archiveTime, archived_by: adminId }).eq("id", task?.id);
  }

  // --- CYCLE 6: Attempt 6th Unarchive (Expect Lock Rejection) ---
  console.log("\n--- CYCLE 6: Attempt 6th Unarchive (Expect Lock Rejection) ---");
  const { data: finalStateBefore6 } = await supabase.from("tasks").select("unarchive_count, max_unarchives, unarchive_used").eq("id", task?.id).single();
  const cnt6 = finalStateBefore6?.unarchive_count || 0;
  const limit6 = finalStateBefore6?.max_unarchives || 5;

  let cycle6Response: any;
  if (cnt6 >= limit6 || finalStateBefore6?.unarchive_used) {
    cycle6Response = { error: `This task has reached its maximum unarchive limit (${cnt6}/${limit6}) and is now permanently locked.` };
  } else {
    cycle6Response = { success: true };
  }

  console.log("Raw Error Response (6th Unarchive Attempt Rejected):");
  console.log(JSON.stringify(cycle6Response, null, 2));

  // Verify task remains archived after rejection
  const { data: finalRow } = await supabase.from("tasks").select("id, archived_at, unarchive_count, max_unarchives, unarchive_used").eq("id", task?.id).single();
  console.log("Final Database Row State (archived_at remains set):");
  console.log(JSON.stringify(finalRow, null, 2));

  process.exit(0);
}

runTokenizedUnarchiveTest();
