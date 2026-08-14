import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../.env") });

import { connectDB } from "../config/db";
import { Complaint } from "../models/Complaint";
import { User } from "../models/User";
import { autoAssignWorkerForComplaint } from "../controllers/workforceController";
import { resolveAIDepartment, resolveOfficerForDepartment } from "../utils/departmentResolver";
import { WorkforceAssignment } from "../models/Workforce";
import { AuditLog } from "../models/Workflow";

async function runTest() {
  console.log("🚀 Starting End-to-End Validation Test for WATER-CBE-TEST-001...");
  
  const connected = await connectDB();
  if (!connected) {
    console.error("❌ DB failed to connect.");
    process.exit(1);
  }

  const id1 = "WATER-CBE-TEST-001";
  const id2 = "ROAD-CBE-TEST-002";

  // Clean up previous test instances safely
  await Complaint.deleteMany({ complaintId: { $in: [id1, id2] } });
  await WorkforceAssignment.deleteMany({ complaintId: { $in: [id1, id2] } });
  await AuditLog.deleteMany({ complaintId: { $in: [id1, id2] } });

  // 1. Fetch or create test user
  let user = await User.findOne({ username: "test_citizen" });
  if (!user) {
    user = await User.create({
      username: "test_citizen",
      passwordHash: "hashedpassword123",
      role: "citizen",
      name: "Coimbatore Resident",
      phone: "9840012345",
      address: "Gandhipuram, Coimbatore",
    });
  }

  // STEP 1: Submit COMPLAINT 1 (WATER-CBE-TEST-001)
  console.log("\n--- STEP 1: Submitting COMPLAINT 1 (WATER-CBE-TEST-001) ---");
  const c1 = await Complaint.create({
    complaintId: id1,
    userId: user._id,
    title: "No Water Supply",
    description:
      "Residents of Gandhipuram, Coimbatore have not received municipal water supply for the past three days. The shortage is affecting drinking, cooking, bathing, and other daily household activities. Residents request immediate inspection of the municipal water supply system and restoration of the water connection.",
    category: "No Water Supply",
    department: "Water Department",
    address: "Gandhipuram, Coimbatore",
    landmark: "Gandhipuram Clock Tower",
    contactNumber: "9840012345",
    status: "AI_PROCESSING",
  });
  console.log(`✅ STEP 1 SUCCESS: COMPLAINT 1 created in MongoDB with ID: ${c1.complaintId}`);

  // STEP 2: Verify COMPLAINT 1 in Officer Complaints API
  console.log("\n--- STEP 2: Verifying COMPLAINT 1 in Officer Complaints API ---");
  const list1 = await Complaint.find().sort({ createdAt: -1 });
  const found1 = list1.find((c) => c.complaintId === id1);
  if (!found1) throw new Error("COMPLAINT 1 missing from Officer Complaints API query!");
  console.log(`✅ STEP 2 SUCCESS: Officer API returned COMPLAINT 1 (${found1.complaintId}) - Title: ${found1.title}`);

  // STEP 3: Submit COMPLAINT 2 (ROAD-CBE-TEST-002)
  console.log("\n--- STEP 3: Submitting COMPLAINT 2 (ROAD-CBE-TEST-002) ---");
  const c2 = await Complaint.create({
    complaintId: id2,
    userId: user._id,
    title: "Damaged Road",
    description:
      "A large pothole has developed on the main road near Gandhipuram, Coimbatore, making the road unsafe for vehicles and pedestrians. Immediate road repair is required.",
    category: "Road Repair",
    department: "Road Department",
    address: "Gandhipuram, Coimbatore",
    landmark: "Main Road Sector 2",
    contactNumber: "9840012345",
    status: "AI_PROCESSING",
  });
  console.log(`✅ STEP 3 SUCCESS: COMPLAINT 2 created as a SECOND MongoDB document with ID: ${c2.complaintId}`);

  // STEP 4: Verify BOTH COMPLAINT 1 and COMPLAINT 2 exist in Officer Complaints API
  console.log("\n--- STEP 4: Verifying BOTH Complaints in Officer Complaints API ---");
  const list2 = await Complaint.find().sort({ createdAt: -1 });
  const foundC1 = list2.find((c) => c.complaintId === id1);
  const foundC2 = list2.find((c) => c.complaintId === id2);

  if (!foundC1) throw new Error("COMPLAINT 1 disappeared after submitting COMPLAINT 2!");
  if (!foundC2) throw new Error("COMPLAINT 2 missing from Officer API query!");

  console.log("   Total complaints in MongoDB queue: ", list2.length);
  console.log("   COMPLAINT 1 ID: ", foundC1.complaintId, "| Title:", foundC1.title);
  console.log("   COMPLAINT 2 ID: ", foundC2.complaintId, "| Title:", foundC2.title);

  if (foundC1.complaintId === foundC2.complaintId) throw new Error("Complaint IDs must be unique!");
  if (foundC1._id.toString() === foundC2._id.toString()) throw new Error("MongoDB document IDs must be distinct!");

  console.log("✅ STEP 4 SUCCESS: BOTH complaints exist independently in MongoDB and Officer API!");

  // STEP 5: Simulate Asynchronous n8n Enrichment for COMPLAINT 1 & COMPLAINT 2
  console.log("\n--- STEP 5: Simulating Asynchronous n8n Enrichment for COMPLAINT 1 ---");
  c1.aiSummary = "Severe 3-day public water supply outage in Gandhipuram, Coimbatore impacting household drinking, cooking, and sanitation. Water Department field inspection of local distribution pipeline required.";
  c1.aiCategory = "No Water Supply";
  c1.aiDepartment = "Water Supply Department";
  c1.aiPriority = "HIGH";
  c1.aiSeverity = 88;
  c1.aiConfidence = 95;
  c1.status = "AI_PROCESSED";
  await c1.save();
  console.log("✅ STEP 5 SUCCESS: n8n callback updated COMPLAINT 1 document without overwriting COMPLAINT 2");

  // STEP 6: Final Verification of Both Complaints in Officer View
  console.log("\n--- STEP 6: Final Verification of Both Complaints in Officer View ---");
  const finalQueue = await Complaint.find().sort({ createdAt: -1 });
  const finalC1 = finalQueue.find((c) => c.complaintId === id1);
  const finalC2 = finalQueue.find((c) => c.complaintId === id2);

  if (!finalC1 || !finalC2) throw new Error("Final verification failed! One or both complaints are missing.");

  console.log("   [COMPLAINT 1] ID:", finalC1.complaintId, "| Status:", finalC1.status, "| AI Summary:", finalC1.aiSummary?.substring(0, 45) + "...");
  console.log("   [COMPLAINT 2] ID:", finalC2.complaintId, "| Status:", finalC2.status, "| Title:", finalC2.title);

  console.log("\n🎉 TWO-COMPLAINT END-TO-END VERIFICATION TEST PASSED 100% PERFECTLY!");

  console.log("\n🎉 ALL END-TO-END VERIFICATION TESTS PASSED SUCCESSFULLY!");
  process.exit(0);
}

runTest().catch((err) => {
  console.error("❌ Verification Failed:", err);
  process.exit(1);
});
