/**
 * TEST N8N CALLBACK PERSISTENCE
 * Run: cd backend && npx ts-node --project tsconfig.json src/scripts/testN8NCallback.ts
 */
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import { Complaint } from "../models/Complaint";
import { resolveAIDepartment, resolveOfficerForDepartment } from "../utils/departmentResolver";
import { Types } from "mongoose";

async function main() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || "";
  await mongoose.connect(mongoUri);
  console.log("✅ Connected to MongoDB");

  const complaintId = "TN-2026-000005";
  const complaint = await Complaint.findOne({ complaintId });

  if (!complaint) {
    console.error(`❌ Complaint ${complaintId} not found`);
    process.exit(1);
  }

  console.log(`\n📋 BEFORE UPDATE (${complaintId}):`);
  console.log(`  status: ${complaint.status}`);
  console.log(`  aiSummary: ${complaint.aiSummary || "MISSING"}`);
  console.log(`  department: ${complaint.department}`);

  // Sample AI Payload returned by n8n / Gemini workflow for water supply grievance
  const sampleN8NCallbackPayload = {
    complaintId: "TN-2026-000005",
    webhookSecret: "tn_grievance_n8n_secret_2026_key",
    aiSummary: "Automated AI Analysis for TN-2026-000005: Citizen submitted PDF summary reporting severe tap water contamination and foul odor in Coimbatore locality. Urgent municipal water quality inspection and pipe flushing required.",
    aiCategory: "Contaminated Water Supply",
    aiDepartment: "Water Supply",
    aiPriority: "HIGH",
    aiSeverity: 88,
    aiValidationStatus: "VALID",
    aiAnalysis: {
      summary: "Automated AI Analysis for TN-2026-000005: Citizen submitted PDF summary reporting severe tap water contamination and foul odor in Coimbatore locality. Urgent municipal water quality inspection and pipe flushing required.",
      category: "Contaminated Water Supply",
      department: "Water Supply Department",
      priority: "HIGH",
      urgency: "24–48 hours",
      affectedPeople: 120,
      schemeEligible: true,
      scheme: "Pillur-III Water Supply & Sanitation Maintenance Scheme",
      fundAvailable: true,
      recommendedAction: "APPROVAL_REQUIRED",
      reason: [
        "Public health risk due to contaminated drinking water supply",
        "Multiple households in Coimbatore ward affected",
        "Requires immediate pipeline flushing and laboratory quality testing"
      ],
      confidence: 0.94
    }
  };

  // Perform persistence update matching handleN8NWebhookProcessed logic
  const canonicalDept = await resolveAIDepartment(sampleN8NCallbackPayload.aiDepartment);
  const { officerId, officerName } = await resolveOfficerForDepartment(canonicalDept);

  const updatedDoc = await Complaint.findOneAndUpdate(
    { complaintId: sampleN8NCallbackPayload.complaintId },
    {
      $set: {
        status: "AI_PROCESSED",
        aiSummary: sampleN8NCallbackPayload.aiSummary,
        aiCategory: sampleN8NCallbackPayload.aiCategory,
        aiDepartment: sampleN8NCallbackPayload.aiDepartment,
        aiPriority: sampleN8NCallbackPayload.aiPriority as any,
        aiSeverity: sampleN8NCallbackPayload.aiSeverity,
        aiValidationStatus: sampleN8NCallbackPayload.aiValidationStatus as any,
        aiAnalysis: sampleN8NCallbackPayload.aiAnalysis as any,
        aiProcessedAt: new Date(),
        department: canonicalDept || complaint.department,
        assignedOfficer: officerId ? new Types.ObjectId(officerId) : complaint.assignedOfficer
      }
    },
    { new: true }
  );

  console.log(`\n✅ AFTER UPDATE (${complaintId}):`);
  console.log(`  status        : ${updatedDoc?.status}`);
  console.log(`  aiSummary     : ${updatedDoc?.aiSummary}`);
  console.log(`  aiCategory    : ${updatedDoc?.aiCategory}`);
  console.log(`  aiPriority    : ${updatedDoc?.aiPriority}`);
  console.log(`  aiSeverity    : ${updatedDoc?.aiSeverity}`);
  console.log(`  department    : ${updatedDoc?.department}`);
  console.log(`  assignedOfficer: ${updatedDoc?.assignedOfficer} (${officerName})`);

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
