/**
 * DIAGNOSTIC + REPAIR SCRIPT
 *
 * Run with:
 *   cd backend && npx ts-node src/scripts/repairComplaintAssignment.ts
 *
 * This script:
 * 1. Inspects all complaints where department is null/missing but aiDepartment exists
 * 2. Resolves the aiDepartment to a canonical officer department using departmentResolver
 * 3. Assigns complaint.department and complaint.assignedOfficer
 * 4. Prints the before/after for each complaint
 */
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import { Complaint } from "../models/Complaint";
import { User } from "../models/User";
import { resolveAIDepartment, resolveOfficerForDepartment } from "../utils/departmentResolver";

async function main() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/test";
  await mongoose.connect(mongoUri);
  console.log("✅ Connected to MongoDB:", mongoUri.replace(/:([^@]+)@/, ":****@"));

  // ─── 1. Print all officer users ────────────────────────────────────────────
  const officers = await User.find({ role: "officer" }).select("_id name email department");
  console.log("\n📋 Officers in MongoDB:");
  if (officers.length === 0) {
    console.log("  ⚠️  No officers found! Arun Kumar may not be in the DB or may not have role=officer");
  }
  for (const o of officers) {
    console.log(`  _id=${o._id}  name=${o.name}  department="${o.department}"`);
  }

  // ─── 2. Print ALL complaint assignment fields ───────────────────────────────
  const allComplaints = await Complaint.find().select(
    "complaintId status department assignedOfficer aiDepartment aiCategory aiPriority aiSeverity aiSummary aiProcessedAt"
  );
  console.log("\n📋 All complaints (assignment fields):");
  for (const c of allComplaints) {
    console.log(
      `  [${c.complaintId}] status=${c.status} | department="${c.department}" | aiDepartment="${c.aiDepartment}" | assignedOfficer=${c.assignedOfficer}`
    );
  }

  // ─── 3. Repair complaints where department is missing/null but aiDepartment exists ─
  console.log("\n🔧 Repairing complaints with missing department assignment...");
  const needsRepair = allComplaints.filter(
    (c) =>
      (!c.department || c.department === "null" || c.department === "undefined") &&
      c.aiDepartment
  );

  if (needsRepair.length === 0) {
    console.log("  ℹ️  No complaints need department repair (all have department set).");
    console.log("  ℹ️  If Arun still sees 0 complaints, check that his user.department exactly matches complaint.department.");
  }

  for (const complaint of needsRepair) {
    console.log(`\n  Repairing ${complaint.complaintId}...`);
    console.log(`    aiDepartment = "${complaint.aiDepartment}"`);

    const canonicalDept = await resolveAIDepartment(complaint.aiDepartment);
    const { officerId, officerName } = await resolveOfficerForDepartment(canonicalDept);

    console.log(`    resolved → "${canonicalDept}" | officer: ${officerName} (${officerId})`);

    const updateFields: any = {};
    if (canonicalDept) updateFields.department = canonicalDept;
    if (officerId) updateFields.assignedOfficer = new mongoose.Types.ObjectId(officerId);

    if (Object.keys(updateFields).length > 0) {
      await Complaint.updateOne({ complaintId: complaint.complaintId }, { $set: updateFields });
      console.log(`    ✅ Updated: department="${canonicalDept}", assignedOfficer=${officerName}`);
    } else {
      console.log(`    ⚠️  Could not resolve canonical department or officer — complaint left unchanged.`);
    }
  }

  // ─── 4. Also repair complaints whose department doesn't match ANY officer ───
  console.log("\n🔍 Checking for department mismatch (complaint.department doesn't match any officer)...");
  const officerDepts = officers.map((o) => o.department).filter(Boolean) as string[];
  const mismatchedComplaints = allComplaints.filter(
    (c) => c.department && !officerDepts.includes(c.department)
  );
  for (const complaint of mismatchedComplaints) {
    console.log(`\n  Mismatch: ${complaint.complaintId} | department="${complaint.department}" | no matching officer`);
    const canonical = await resolveAIDepartment(complaint.aiDepartment || complaint.department);
    const { officerId, officerName } = await resolveOfficerForDepartment(canonical);
    if (canonical && officerId) {
      await Complaint.updateOne({ complaintId: complaint.complaintId }, { $set: { department: canonical, assignedOfficer: new mongoose.Types.ObjectId(officerId) } });
      console.log(`    ✅ Fixed → department="${canonical}", officer="${officerName}"`);
    } else {
      console.log(`    ⚠️  No matching officer found for "${complaint.department}". Manual check required.`);
    }
  }

  // ─── 5. Final state ─────────────────────────────────────────────────────────
  console.log("\n📋 Final complaint states after repair:");
  const finalComplaints = await Complaint.find().select("complaintId status department assignedOfficer aiDepartment");
  for (const c of finalComplaints) {
    const icon = c.department && c.assignedOfficer ? "✅" : "⚠️ ";
    console.log(`  ${icon} [${c.complaintId}] department="${c.department}" | assignedOfficer=${c.assignedOfficer}`);
  }

  console.log("\n✅ Repair script complete. Restart your backend server and test GET /api/officer/complaints.");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌ Script failed:", err);
  process.exit(1);
});
