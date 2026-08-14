/**
 * TEST DECISION ENGINE FOR TN-2026-000005
 * Run: cd backend && npx ts-node --project tsconfig.json src/scripts/testDecisionEngine.ts
 */
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import { Complaint } from "../models/Complaint";
import { evaluateComplaintDecision } from "../services/decisionEngine";

async function main() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || "";
  await mongoose.connect(mongoUri);
  console.log("✅ Connected to MongoDB");

  const complaintId = "TN-2026-000005";
  console.log(`\n⚙️ Evaluating Decision Pipeline for ${complaintId}...`);

  const result = await evaluateComplaintDecision(complaintId, "Automated Test Script");

  console.log("\n=== DECISION ENGINE EVALUATION RESULT ===");
  console.log("Complaint ID   :", result.complaintId);
  console.log("Decision Path  :", result.decisionPath);
  console.log("Next Action    :", result.nextAction);
  console.log("Reason         :", result.reason);
  console.log("Scheme Match   :", JSON.stringify(result.schemeMatch, null, 2));
  console.log("Eligibility    :", JSON.stringify(result.eligibility, null, 2));
  console.log("Funding Check  :", JSON.stringify(result.funding, null, 2));
  console.log("Priority Result:", JSON.stringify(result.priorityResult, null, 2));

  const updatedDoc = await Complaint.findOne({ complaintId });
  console.log("\n=== MONGODB COMPLAINT PERSISTED FIELDS ===");
  console.log("decisionPath   :", updatedDoc?.decisionPath);
  console.log("approvalStatus :", updatedDoc?.approvalStatus);
  console.log("history count  :", updatedDoc?.decisionHistory?.length);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
