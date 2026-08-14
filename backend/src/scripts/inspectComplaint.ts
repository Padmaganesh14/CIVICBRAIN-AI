/**
 * Inspect TN-2026-000005 exact field values in MongoDB
 * Run: cd backend && npx ts-node --project tsconfig.json src/scripts/inspectComplaint.ts
 */
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function main() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || "";
  await mongoose.connect(mongoUri);

  // Raw lean query — bypasses Mongoose transforms, shows exactly what's in MongoDB
  const db = mongoose.connection.db!;
  const doc = await db.collection("complaints").findOne({ complaintId: "TN-2026-000005" });

  if (!doc) {
    console.log("❌ TN-2026-000005 not found in MongoDB");
    await mongoose.disconnect();
    return;
  }

  console.log("\n=== TN-2026-000005 EXACT MONGODB DOCUMENT ===\n");

  // Print every field
  for (const [key, value] of Object.entries(doc)) {
    if (key === "_id" || key === "userId" || key === "contactNumber") continue; // skip sensitive
    if (typeof value === "object" && value !== null && !Array.isArray(value) && !(value instanceof Date)) {
      console.log(`${key}:`, JSON.stringify(value, null, 2));
    } else {
      console.log(`${key}:`, value);
    }
  }

  console.log("\n=== AI FIELDS SUMMARY ===");
  console.log("aiSummary     :", doc.aiSummary    ?? "❌ MISSING");
  console.log("aiCategory    :", doc.aiCategory   ?? "❌ MISSING");
  console.log("aiDepartment  :", doc.aiDepartment ?? "❌ MISSING");
  console.log("aiPriority    :", doc.aiPriority   ?? "❌ MISSING");
  console.log("aiSeverity    :", doc.aiSeverity   ?? "❌ MISSING");
  console.log("aiValidation  :", doc.aiValidationStatus ?? "❌ MISSING");
  console.log("aiProcessedAt :", doc.aiProcessedAt ?? "❌ MISSING");
  console.log("aiAnalysis    :", doc.aiAnalysis    ? JSON.stringify(doc.aiAnalysis) : "❌ MISSING");
  console.log("department    :", doc.department    ?? "❌ MISSING");
  console.log("assignedOfficer:", doc.assignedOfficer ?? "❌ MISSING");
  console.log("status        :", doc.status);

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
