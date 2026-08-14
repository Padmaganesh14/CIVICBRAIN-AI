/**
 * TEST ATOMIC FUNDING APPROVAL & MONGO MUTATION FOR TN-2026-000005
 * Run: cd backend && npx ts-node --project tsconfig.json src/scripts/testApproveFunding.ts
 */
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import { Complaint } from "../models/Complaint";
import { BudgetProject } from "../models/BudgetProject";
import { FundingTransaction } from "../models/FundingTransaction";

async function main() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || "";
  await mongoose.connect(mongoUri);
  console.log("✅ Connected to MongoDB");

  const complaintId = "TN-2026-000005";
  console.log(`\n⚙️ Testing Atomic Fund Mutation for ${complaintId}...`);

  const complaintBefore = await Complaint.findOne({ complaintId });
  console.log("Complaint Status Before :", complaintBefore?.status);
  console.log("Funding Status Before   :", complaintBefore?.fundingDecision?.status || "UNALLOCATED");

  const fundDocBefore = await BudgetProject.findOne({
    $or: [{ department: /water/i }, { projectName: /pillur/i }],
  });

  const prevAlloc = fundDocBefore?.allocatedAmount ? fundDocBefore.allocatedAmount * 10000000 : 7798600000;
  const prevUtil = fundDocBefore?.utilizedAmount || 0;
  const prevRem = fundDocBefore?.remainingAmount != null ? fundDocBefore.remainingAmount : (prevAlloc - prevUtil);

  console.log("\n--- FUND BEFORE MUTATION ---");
  console.log("Fund ID         :", fundDocBefore?._id);
  console.log("Fund Name       :", fundDocBefore?.projectName);
  console.log("Prev Utilized   : ₹", prevUtil.toLocaleString());
  console.log("Prev Remaining  : ₹", prevRem.toLocaleString());

  const approvedAmount = 250000; // ₹2,50,000

  // Execute atomic mutation
  const newUtil = prevUtil + approvedAmount;
  const newRem = prevRem - approvedAmount;

  const updatedFund = await BudgetProject.findOneAndUpdate(
    { _id: fundDocBefore?._id },
    { $set: { utilizedAmount: newUtil, remainingAmount: newRem } },
    { new: true }
  );

  console.log("\n--- FUND AFTER ATOMIC MUTATION ---");
  console.log("New Utilized    : ₹", updatedFund?.utilizedAmount?.toLocaleString());
  console.log("New Remaining   : ₹", updatedFund?.remainingAmount?.toLocaleString());

  // Record FundingTransaction
  const txId = `TXN-${Date.now()}`;
  const transaction = await FundingTransaction.create({
    transactionId: txId,
    complaintId,
    fundId: fundDocBefore?._id.toString(),
    fundType: "BUDGET_PROJECT",
    fundName: fundDocBefore?.projectName || "Municipal Development Fund",
    amount: approvedAmount,
    balanceBefore: prevRem,
    balanceAfter: newRem,
    approvedBy: "Arun Kumar",
    approvedAt: new Date(),
    status: "ALLOCATED",
    remarks: "Test script atomic fund allocation",
  });

  console.log("\n--- FUNDING TRANSACTION RECORDED ---");
  console.log("Transaction ID  :", transaction.transactionId);
  console.log("Amount Allocated: ₹", transaction.amount.toLocaleString());

  // Update Complaint
  if (complaintBefore) {
    complaintBefore.status = "IN_PROGRESS";
    complaintBefore.approvalStatus = "APPROVED";
    complaintBefore.fundingDecision = {
      status: "ALLOCATED",
      fundId: fundDocBefore?._id.toString(),
      fundName: fundDocBefore?.projectName,
      fundType: "BUDGET_PROJECT",
      amountAllocated: approvedAmount,
      previousRemaining: prevRem,
      remainingAmount: newRem,
      approvedBy: "Arun Kumar",
      approvedAt: new Date(),
      remarks: "Test script funding approval",
    };
    await complaintBefore.save();
  }

  const complaintAfter = await Complaint.findOne({ complaintId });
  console.log("\n--- COMPLAINT AFTER MUTATION ---");
  console.log("Complaint Status After :", complaintAfter?.status);
  console.log("Funding Status After   :", complaintAfter?.fundingDecision?.status);
  console.log("Remaining Balance Stored:", complaintAfter?.fundingDecision?.remainingAmount?.toLocaleString());

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
