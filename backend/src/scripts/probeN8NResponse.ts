/**
 * Inspect the EXACT n8n response structure for one complaint
 * Run: cd backend && npx ts-node --project tsconfig.json src/scripts/probeN8NResponse.ts
 */
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import { Complaint } from "../models/Complaint";
import { User } from "../models/User"; // register model for populate
import { triggerN8NWorkflow } from "../services/n8nService";

async function main() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || "";
  await mongoose.connect(mongoUri);

  const complaint = await Complaint.findOne({ complaintId: "TN-2026-000005" });
  if (!complaint) { console.log("Not found"); process.exit(1); }

  // Reset so n8n will respond
  await Complaint.updateOne({ _id: complaint._id }, { $set: { status: "AI_PROCESSING" } });

  const mockUser = { userId: complaint.userId?.toString() || "", username: "citizen", name: "Citizen" };

  console.log("📡 Triggering n8n...");
  try {
    const result = await triggerN8NWorkflow(complaint, mockUser);
    console.log("\n=== FULL n8n RESPONSE ===");
    console.log(JSON.stringify(result, null, 2));
    console.log("\n=== KEYS AT TOP LEVEL ===", Object.keys(result || {}));
    console.log("result.ai       =", result?.ai);
    console.log("result.data     =", result?.data);
    console.log("result.summary  =", result?.summary);
    if (result?.data) {
      console.log("\n=== KEYS INSIDE result.data ===", Object.keys(result.data));
      console.log("result.data.summary  =", result.data.summary);
      console.log("result.data.category =", result.data.category);
      console.log("result.data.priority =", result.data.priority);
    }
  } catch (err: any) {
    console.error("❌ n8n failed:", err.message);
    await Complaint.updateOne({ _id: complaint._id }, { $set: { status: "AI_PROCESSING_FAILED" } });
  }

  await mongoose.disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
