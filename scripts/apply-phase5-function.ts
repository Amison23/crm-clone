import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, serviceKey);

async function runAutoArchiveFunction() {
  console.log("=== AUTO ARCHIVE ENGINE EXECUTION ===");

  // Fetch all active companies with settings
  const { data: companies } = await supabase
    .from("companies")
    .select("id, name, archive_after_days, archive_count_threshold");

  console.log(`Processing ${companies?.length || 0} companies...`);

  let totalArchived = 0;

  for (const comp of companies || []) {
    const afterDays = comp.archive_after_days ?? 30;
    const threshold = comp.archive_count_threshold ?? 20;

    // 1. Count non-archived completed tasks
    const { count: completedCount } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("company_id", comp.id)
      .eq("status", "completed")
      .is("archived_at", null);

    const currentCompleted = completedCount || 0;
    console.log(`Company: ${comp.name || comp.id}`);
    console.log(`  Threshold: ${threshold}, Active Completed Tasks: ${currentCompleted}`);

    if (currentCompleted > threshold) {
      // 2. Identify old completed tasks older than archive_after_days
      const cutoffDate = new Date(Date.now() - afterDays * 86400000).toISOString();

      const { data: oldTasks } = await supabase
        .from("tasks")
        .select("id, title, created_at, updated_at")
        .eq("company_id", comp.id)
        .eq("status", "completed")
        .is("archived_at", null)
        .lt("created_at", cutoffDate)
        .order("created_at", { ascending: true });

      console.log(`  Found ${oldTasks?.length || 0} tasks older than ${afterDays} days to auto-archive.`);

      const now = new Date().toISOString();
      for (const t of oldTasks || []) {
        // Idempotent update: set archived_at only if currently null
        const { data: updated, error } = await supabase
          .from("tasks")
          .update({ archived_at: now, archived_by: null })
          .eq("id", t.id)
          .is("archived_at", null)
          .select("id")
          .single();

        if (updated) {
          totalArchived++;
          // Insert audit log with system actor (actor_id = null) and action = AUTO_ARCHIVE_TASK
          await supabase.from("audit_logs").insert({
            actor_id: null,
            action: "AUTO_ARCHIVE_TASK",
            entity_type: "task",
            entity_id: t.id,
            payload: { auto: true, company_id: comp.id, archive_after_days: afterDays }
          });
        }
      }
    } else {
      console.log(`  Completed task count (${currentCompleted}) <= threshold (${threshold}). Untouched.`);
    }
  }

  console.log(`\nAuto-archive complete. Total tasks archived: ${totalArchived}`);
  process.exit(0);
}

runAutoArchiveFunction();
