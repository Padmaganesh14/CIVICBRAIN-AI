/**
 * REPROCESS SCRIPT — Re-trigger n8n for complaints missing AI fields
 *
 * Run with:
 *   cd backend && npx ts-node --project tsconfig.json src/scripts/reprocessMissingAI.ts
 *
 * This finds all complaints that are AI_PROCESSED but lack aiSummary, and
 * re-triggers n8n analysis so the AI result gets persisted properly.
 */
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import { Complaint } from "../models/Complaint";
import { triggerN8NWorkflow } from "../services/n8nService";
import { resolveAIDepartment, resolveOfficerForDepartment } from "../utils/departmentResolver";

async function main() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || "";
  await mongoose.connect(mongoUri);
  console.log("✅ Connected to MongoDB");

  // Find complaints where AI processing happened but AI fields are missing
  const complaints = await Complaint.find({
    status: { $in: ["AI_PROCESSED", "AI_PROCESSING_FAILED"] },
    aiSummary: { $in: [null, undefined, ""] },
  }).populate("userId", "username name phone");

  console.log(`\n📋 Found ${complaints.length} complaint(s) with missing AI data:`);
  for (const c of complaints) {
    console.log(`  [${c.complaintId}] status=${c.status} | aiSummary=${c.aiSummary ?? "❌ MISSING"}`);
  }

  if (complaints.length === 0) {
    console.log("\n✅ No complaints need reprocessing.");
    await mongoose.disconnect();
    return;
  }

  for (const complaint of complaints) {
    console.log(`\n🔄 Reprocessing ${complaint.complaintId}...`);

    // Reset status to AI_PROCESSING so the webhook idempotency check allows the update
    await Complaint.updateOne({ _id: complaint._id }, { $set: { status: "AI_PROCESSING" } });

    try {
      const userObj = complaint.userId as any;
      const mockUser = {
        userId: userObj?._id?.toString() || "",
        username: userObj?.username || "citizen",
        name: userObj?.name || "",
      };

      const result = await triggerN8NWorkflow(complaint, mockUser);
      const aiData = result?.ai || result;

      console.log(`  n8n response keys: ${Object.keys(aiData || {}).join(", ")}`);

      // Persist ALL AI fields returned by n8n
      const updateFields: Record<string, any> = {
        status: "AI_PROCESSED",
        aiProcessedAt: new Date(),
      };

      if (aiData?.summary != null)         { updateFields.aiSummary = aiData.summary; }
      if (aiData?.category != null)        { updateFields.aiCategory = aiData.category; }
      if (aiData?.priority != null)        { updateFields.aiPriority = aiData.priority; }
      if (aiData?.severity != null)        { updateFields.aiSeverity = Number(aiData.severity); }
      if (aiData?.validationStatus != null){ updateFields.aiValidationStatus = aiData.validationStatus; }
      if (aiData?.department != null)      { updateFields.aiDepartment = aiData.department; }

      // Build aiAnalysis subdoc
      const analysis: Record<string, any> = {};
      if (aiData?.summary != null)           analysis.summary = aiData.summary;
      if (aiData?.category != null)          analysis.category = aiData.category;
      if (aiData?.department != null)        analysis.department = aiData.department;
      if (aiData?.priority != null)          analysis.priority = aiData.priority;
      if (aiData?.urgency != null)           analysis.urgency = aiData.urgency;
      if (aiData?.affectedPeople != null)    analysis.affectedPeople = Number(aiData.affectedPeople);
      if (aiData?.schemeEligible != null)    analysis.schemeEligible = aiData.schemeEligible;
      if (aiData?.scheme != null)            analysis.scheme = aiData.scheme;
      if (aiData?.fundAvailable != null)     analysis.fundAvailable = aiData.fundAvailable;
      if (aiData?.recommendedAction != null) analysis.recommendedAction = aiData.recommendedAction;
      if (aiData?.confidence != null)        analysis.confidence = aiData.confidence;
      if (Array.isArray(aiData?.reason) && aiData.reason.length > 0) analysis.reason = aiData.reason;

      if (Object.keys(analysis).length > 0) {
        updateFields.aiAnalysis = analysis;
      }

      // Resolve department → canonical → officer
      const canonicalDept = await resolveAIDepartment(aiData?.department ?? null);
      if (canonicalDept) updateFields.department = canonicalDept;
      const { officerId } = await resolveOfficerForDepartment(canonicalDept);
      if (officerId) updateFields.assignedOfficer = new mongoose.Types.ObjectId(officerId);

      await Complaint.updateOne({ _id: complaint._id }, { $set: updateFields });

      console.log(`  ✅ ${complaint.complaintId} updated:`);
      console.log(`     aiSummary : ${updateFields.aiSummary?.substring(0, 60) ?? "❌ still missing"}`);
      console.log(`     aiCategory: ${updateFields.aiCategory ?? "❌"}`);
      console.log(`     aiPriority: ${updateFields.aiPriority ?? "❌"}`);
      console.log(`     aiSeverity: ${updateFields.aiSeverity ?? "❌"}`);
      console.log(`     department: ${updateFields.department ?? "(unchanged)"}`);
      console.log(`     officer   : ${officerId ?? "❌"}`);

    } catch (err: any) {
      // If n8n is unreachable, reset status back
      await Complaint.updateOne({ _id: complaint._id }, { $set: { status: "AI_PROCESSING_FAILED" } });
      console.error(`  ❌ n8n trigger failed for ${complaint.complaintId}: ${err.message}`);
      console.error("     Make sure ngrok is running and n8n workflow is active.");
    }
  }

  console.log("\n✅ Reprocess complete. Run inspectComplaint.ts to verify.");
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
