import { sendNotificationEmail } from "../lib/notifications/email";
import * as dotenv from "dotenv";

// Load env vars
dotenv.config({ path: ".env.local" });

async function main() {
  console.log("Triggering test email notification...");

  const result = await sendNotificationEmail({
    recipientEmail: "mbuguavictor1@gmail.com",
    recipientName: "Test Agent",
    eventType: "LEAD_REASSIGNED",
    subject: "Test: Lead Reassigned To You",
    body: "This is a test notification to verify the Resend email integration is working as expected. You have been assigned a new high-value lead.",
    metadata: { testMode: true }
  });

  if (result.success) {
    console.log("✅ Email sent successfully! Message ID:", result.messageId);
  } else {
    console.error("❌ Failed to send email:", result.error);
  }
}

main().catch(console.error);
