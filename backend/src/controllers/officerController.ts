import mongoose from "mongoose";
import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { Complaint, IAttachment } from "../models/Complaint";
import { AuditLog, Notification } from "../models/Workflow";
import { User } from "../models/User";
import { BudgetProject } from "../models/BudgetProject";
import { BudgetFundSummary } from "../models/BudgetFundSummary";
import { FundingTransaction } from "../models/FundingTransaction";
import { evaluateComplaintDecision } from "../services/decisionEngine";

// Flexible status workflow state transitions for Officers
const VALID_TRANSITIONS: Record<string, string[]> = {
  SUBMITTED: ["AI_PROCESSING", "AI_PROCESSED", "ASSIGNED", "UNDER_REVIEW", "IN_PROGRESS", "RESOLVED"],
  AI_PROCESSING: ["AI_PROCESSED", "AI_PROCESSING_FAILED", "ASSIGNED", "UNDER_REVIEW", "IN_PROGRESS"],
  AI_PROCESSING_FAILED: ["AI_PROCESSING", "ASSIGNED", "UNDER_REVIEW", "IN_PROGRESS"],
  AI_PROCESSED: ["ASSIGNED", "UNDER_REVIEW", "IN_PROGRESS", "RESOLVED"],
  ASSIGNED: ["UNDER_REVIEW", "IN_PROGRESS", "RESOLVED"],
  UNDER_REVIEW: ["ASSIGNED", "IN_PROGRESS", "RESOLVED"],
  IN_PROGRESS: ["UNDER_REVIEW", "RESOLVED", "CLOSED"],
  SCHEME_REJECTED: ["UNDER_REVIEW", "IN_PROGRESS", "RESOLVED"],
  NOT_ELIGIBLE: ["UNDER_REVIEW", "IN_PROGRESS", "RESOLVED"],
  FUND_APPROVED: ["ASSIGNED", "IN_PROGRESS", "RESOLVED"],
  RESOLVED: ["CLOSED", "IN_PROGRESS"],
  CLOSED: ["RESOLVED", "IN_PROGRESS"],
};

export const getOfficerComplaints = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { department: queryDept, filterDept } = req.query;

    let filter: any = {};

    if (queryDept && typeof queryDept === "string" && queryDept !== "ALL") {
      const deptRegex = new RegExp(queryDept.split(" ")[0] || "", "i");
      filter = {
        $or: [
          { department: queryDept },
          { aiDepartment: queryDept },
          { department: deptRegex },
        ],
      };
    } else if (filterDept && typeof filterDept === "string" && filterDept !== "ALL") {
      const deptRegex = new RegExp(filterDept.split(" ")[0] || "", "i");
      filter = {
        $or: [
          { department: filterDept },
          { aiDepartment: filterDept },
          { department: deptRegex },
        ],
      };
    }

    // Single Source of Truth: Return real complaints from MongoDB, newest first
    const complaints = await Complaint.find(filter)
      .populate("userId", "username name phone")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: complaints });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateComplaintStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { complaintId } = req.params;
    const { status } = req.body;

    const complaint = await Complaint.findOne({ complaintId });
    if (!complaint) {
      res.status(404).json({ success: false, message: "Complaint not found." });
      return;
    }

    if (req.user!.department && complaint.department !== req.user!.department) {
      res.status(403).json({ success: false, message: "Access denied. Outside your department." });
      return;
    }

    const currentStatus = complaint.status;
    const allowed = VALID_TRANSITIONS[currentStatus] || [];

    if (!allowed.includes(status)) {
      res.status(400).json({
        success: false,
        message: `Invalid status transition from ${currentStatus} to ${status}. Allowed transitions: ${allowed.join(", ") || "None"}`,
      });
      return;
    }

    complaint.status = status as any;
    if (status === "CLOSED") {
      complaint.closedAt = new Date();
    }
    await complaint.save();

    await AuditLog.create({
      complaintId,
      userId: req.user!.userId as any,
      activity: `Status changed from ${currentStatus} to ${status} by Officer ${req.user!.username}`,
    });

    await Notification.create({
      complaintId,
      userId: complaint.userId,
      message: `Your complaint ${complaintId} status updated to ${status}.`,
    });

    res.status(200).json({ success: true, message: `Status updated to ${status}.`, data: complaint });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addOfficerRemarks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { complaintId } = req.params;
    const { remarks } = req.body;

    if (!remarks) {
      res.status(400).json({ success: false, message: "Remarks are required." });
      return;
    }

    const complaint = await Complaint.findOne({ complaintId });
    if (!complaint) {
      res.status(404).json({ success: false, message: "Complaint not found." });
      return;
    }

    if (req.user!.department && complaint.department !== req.user!.department) {
      res.status(403).json({ success: false, message: "Access denied. Outside your department." });
      return;
    }

    complaint.officerRemarks = remarks;
    await complaint.save();

    await AuditLog.create({
      complaintId,
      userId: req.user!.userId as any,
      activity: `Officer remarks added by ${req.user!.username}: "${remarks}"`,
    });

    res.status(200).json({ success: true, message: "Remarks added successfully.", data: complaint });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const uploadResolutionProof = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { complaintId } = req.params;
    const complaint = await Complaint.findOne({ complaintId });
    if (!complaint) {
      res.status(404).json({ success: false, message: "Complaint not found." });
      return;
    }

    if (req.user!.department && complaint.department !== req.user!.department) {
      res.status(403).json({ success: false, message: "Access denied. Outside your department." });
      return;
    }

    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      const newAttachments: IAttachment[] = files.map((file) => ({
        url: `/uploads/complaints/${file.filename}`,
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      }));
      complaint.resolutionProof = [...(complaint.resolutionProof || []), ...newAttachments];
      await complaint.save();
    }

    res.status(200).json({ success: true, message: "Resolution proof uploaded.", data: complaint });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getComplaintDecisionEndpoint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rawId = req.params.complaintId;
    const complaintId = Array.isArray(rawId) ? rawId[0] : rawId;
    const complaint = await Complaint.findOne({ complaintId });
    if (!complaint) {
      res.status(404).json({ success: false, message: "Complaint not found." });
      return;
    }

    if (req.user!.department && complaint.department && complaint.department !== req.user!.department) {
      res.status(403).json({ success: false, message: "Access denied. Outside your department workspace." });
      return;
    }

    if (!complaint.decisionPath) {
      const evaluation = await evaluateComplaintDecision(complaintId, `Officer ${req.user!.username}`);
      res.status(200).json({ success: true, data: evaluation });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        complaintId: complaint.complaintId,
        decisionPath: complaint.decisionPath,
        reason: complaint.schemeMatch?.matchReason || complaint.priorityResult?.reason || "Evaluated by Decision Engine",
        nextAction: complaint.decisionPath === "SCHEME_APPROVAL" ? "OFFICER_APPROVAL" : complaint.decisionPath === "PRIORITIZATION" ? "AI_PRIORITIZATION" : "OFFICER_REVIEW",
        schemeMatch: complaint.schemeMatch,
        eligibility: complaint.eligibilityResult,
        funding: complaint.fundingCheck,
        priorityResult: complaint.priorityResult,
        approvalStatus: complaint.approvalStatus || "PENDING_OFFICER",
        decisionHistory: complaint.decisionHistory || [],
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const evaluateComplaintDecisionEndpoint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rawId = req.params.complaintId;
    const complaintId = Array.isArray(rawId) ? rawId[0] : rawId;
    const complaint = await Complaint.findOne({ complaintId });
    if (!complaint) {
      res.status(404).json({ success: false, message: "Complaint not found." });
      return;
    }

    if (req.user!.department && complaint.department && complaint.department !== req.user!.department) {
      res.status(403).json({ success: false, message: "Access denied. Outside your department workspace." });
      return;
    }

    const evaluation = await evaluateComplaintDecision(complaintId, `Officer ${req.user!.username}`);
    res.status(200).json({ success: true, data: evaluation });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const approveFundingAllocation = async (req: AuthRequest, res: Response): Promise<void> => {
  const rawId = req.params.complaintId;
  const complaintId = Array.isArray(rawId) ? rawId[0] : rawId;
  const { amount, remarks } = req.body;

  const officerUsername = req.user!.username;
  const officerDepartment = req.user!.department;

  let session: mongoose.ClientSession | null = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
  } catch (_e) {
    session = null;
  }

  try {
    // 1. Load complaint
    const complaint = session
      ? await Complaint.findOne({ complaintId }).session(session)
      : await Complaint.findOne({ complaintId });

    if (!complaint) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      res.status(404).json({ success: false, message: "Complaint not found." });
      return;
    }

    // 2. Verify officer is authorized for complaint department
    if (officerDepartment && complaint.department && complaint.department !== officerDepartment) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      res.status(403).json({ success: false, message: "Access denied. Outside your department workspace." });
      return;
    }

    // 3. Verify complaint is not already funded
    if (complaint.fundingDecision?.status === "ALLOCATED") {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      res.status(400).json({
        success: false,
        message: `Complaint ${complaintId} has already been allocated funding (₹${complaint.fundingDecision.amountAllocated?.toLocaleString() || complaint.fundingDecision.amountAllocated}).`,
      });
      return;
    }

    // Determine approved amount
    const approvedAmount = typeof amount === "number" && amount > 0 ? amount : complaint.fundingCheck?.requiredAmount || 250000;

    // 4. Load target fund document
    const category = (complaint.aiCategory || complaint.category || complaint.title || "").toLowerCase();
    const searchDept = (complaint.department || officerDepartment || "").replace("Department", "").trim();

    let fundDoc = session
      ? await BudgetProject.findOne({
          $or: [
            { department: new RegExp(searchDept, "i") },
            { section: new RegExp(searchDept, "i") },
            { projectName: new RegExp(category.split(" ")[0] || "water", "i") },
          ],
        }).session(session)
      : await BudgetProject.findOne({
          $or: [
            { department: new RegExp(searchDept, "i") },
            { section: new RegExp(searchDept, "i") },
            { projectName: new RegExp(category.split(" ")[0] || "water", "i") },
          ],
        });

    if (!fundDoc) {
      fundDoc = session ? await BudgetProject.findOne().session(session) : await BudgetProject.findOne();
    }

    if (!fundDoc) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      res.status(404).json({ success: false, message: "No municipal fund document found in MongoDB database." });
      return;
    }

    // 5. Read current real balance
    const currentAllocation = fundDoc.allocatedAmount ? fundDoc.allocatedAmount * 10000000 : fundDoc.estimatedCost ? fundDoc.estimatedCost * 10000000 : 10000000;
    const currentUtilized = fundDoc.utilizedAmount || 0;
    const currentRemaining = fundDoc.remainingAmount != null ? fundDoc.remainingAmount : (currentAllocation - currentUtilized);

    // 6. Verify remainingAmount >= approvedAmount
    if (currentRemaining < approvedAmount) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      res.status(400).json({
        success: false,
        message: `Insufficient funds or fund balance changed. Available: ₹${currentRemaining.toLocaleString()}, Requested: ₹${approvedAmount.toLocaleString()}.`,
      });
      return;
    }

    // 7. Atomic Concurrency-Protected Fund Update
    const newUtilized = currentUtilized + approvedAmount;
    const newRemaining = currentRemaining - approvedAmount;

    let updatedFund: any = null;
    if (session) {
      updatedFund = await BudgetProject.findOneAndUpdate(
        {
          _id: fundDoc._id,
          $or: [{ remainingAmount: { $gte: approvedAmount } }, { remainingAmount: null }],
        },
        {
          $set: {
            utilizedAmount: newUtilized,
            remainingAmount: newRemaining,
          },
        },
        { new: true, session }
      );
    } else {
      updatedFund = await BudgetProject.findOneAndUpdate(
        {
          _id: fundDoc._id,
          $or: [{ remainingAmount: { $gte: approvedAmount } }, { remainingAmount: null }],
        },
        {
          $set: {
            utilizedAmount: newUtilized,
            remainingAmount: newRemaining,
          },
        },
        { new: true }
      );
    }

    if (!updatedFund) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      res.status(400).json({
        success: false,
        message: "Insufficient funds or fund balance changed concurrently. Please refresh and try again.",
      });
      return;
    }

    // 8. Create FundingTransaction
    const txId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const txData = {
      transactionId: txId,
      complaintId,
      fundId: fundDoc._id.toString(),
      fundType: "BUDGET_PROJECT",
      fundName: fundDoc.projectName || "Municipal Development Fund",
      amount: approvedAmount,
      balanceBefore: currentRemaining,
      balanceAfter: newRemaining,
      approvedBy: officerUsername,
      approvedAt: new Date(),
      status: "ALLOCATED" as const,
      remarks: remarks || "Approved & allocated via Officer Portal Decision Engine",
    };

    let transaction: any = null;
    if (session) {
      const created = await FundingTransaction.create([txData], { session });
      transaction = created[0];
    } else {
      transaction = await FundingTransaction.create(txData);
    }

    // 9. Update SAME Complaint document
    complaint.fundingDecision = {
      status: "ALLOCATED",
      fundId: fundDoc._id.toString(),
      fundName: fundDoc.projectName || "Municipal Development Fund",
      fundType: "BUDGET_PROJECT",
      amountAllocated: approvedAmount,
      previousRemaining: currentRemaining,
      remainingAmount: newRemaining,
      approvedBy: officerUsername,
      approvedAt: new Date(),
      remarks: remarks || "Funding approved & allocated",
    };

    complaint.status = "IN_PROGRESS";
    complaint.approvalStatus = "APPROVED";

    if (!complaint.decisionHistory) complaint.decisionHistory = [];
    complaint.decisionHistory.push({
      timestamp: new Date(),
      action: `Officer ${officerUsername} approved and allocated ₹${approvedAmount.toLocaleString()} from ${fundDoc.projectName}.`,
      actor: officerUsername,
      details: `Fund ${fundDoc._id}: Previous ₹${currentRemaining.toLocaleString()} → New ₹${newRemaining.toLocaleString()}`,
    });

    if (session) {
      await complaint.save({ session });
      await session.commitTransaction();
      session.endSession();
    } else {
      await complaint.save();
    }

    await AuditLog.create({
      complaintId,
      userId: req.user!.userId as any,
      activity: `Funding Approved: ₹${approvedAmount.toLocaleString()} allocated from ${fundDoc.projectName} by Officer ${officerUsername}. Remaining balance updated to ₹${newRemaining.toLocaleString()}.`,
    });

    res.status(200).json({
      success: true,
      message: "Funding approved and allocated successfully",
      complaintId,
      fund: {
        fundId: fundDoc._id.toString(),
        fundName: fundDoc.projectName,
        amountAllocated: approvedAmount,
        previousRemaining: currentRemaining,
        remainingAmount: newRemaining,
        utilizedAmount: newUtilized,
      },
      transaction,
      complaint,
    });
  } catch (err: any) {
    if (session) {
      try {
        await session.abortTransaction();
        session.endSession();
      } catch (_e) {}
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getFundingTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const transactions = await FundingTransaction.find().sort({ createdAt: -1 }).limit(50);
    res.status(200).json({ success: true, data: transactions });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const decideComplaint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { complaintId } = req.params;
    const { decision, remarks } = req.body;

    if (!decision || !["APPROVED", "RESOLVED", "REJECTED", "IN_PROGRESS", "CLARIFICATION_REQUESTED"].includes(decision)) {
      res.status(400).json({ success: false, message: "Valid decision required (APPROVED, RESOLVED, REJECTED, IN_PROGRESS, CLARIFICATION_REQUESTED)." });
      return;
    }

    const complaint = await Complaint.findOne({ complaintId });
    if (!complaint) {
      res.status(404).json({ success: false, message: "Complaint not found." });
      return;
    }

    if (req.user!.department && complaint.department && complaint.department !== req.user!.department) {
      res.status(403).json({ success: false, message: "Access denied. Outside your department workspace." });
      return;
    }

    const previousStatus = complaint.status;
    let newStatus = complaint.status;

    if (decision === "APPROVED" || decision === "RESOLVED") {
      newStatus = "RESOLVED";
      complaint.status = "RESOLVED";
      complaint.approvalStatus = "APPROVED";
    } else if (decision === "REJECTED") {
      newStatus = "CLOSED";
      complaint.status = "CLOSED";
      complaint.approvalStatus = "REJECTED";
    } else if (decision === "IN_PROGRESS") {
      newStatus = "IN_PROGRESS";
      complaint.status = "IN_PROGRESS";
      complaint.approvalStatus = "PENDING_OFFICER";
    } else if (decision === "CLARIFICATION_REQUESTED") {
      newStatus = "UNDER_REVIEW";
      complaint.status = "UNDER_REVIEW";
      complaint.approvalStatus = "NEEDS_REVIEW";
    }

    if (remarks) {
      complaint.officerRemarks = remarks;
    }

    complaint.officerDecision = {
      decision: decision === "RESOLVED" ? "APPROVED" : decision,
      remarks,
      decidedBy: req.user!.username,
      decidedAt: new Date(),
    };

    if (!complaint.decisionHistory) complaint.decisionHistory = [];
    complaint.decisionHistory.push({
      timestamp: new Date(),
      action: `Officer ${req.user!.username} rendered decision: ${decision}`,
      actor: req.user!.username,
      details: remarks || `Status set to ${newStatus}`,
    });

    if (decision === "REJECTED") {
      complaint.closedAt = new Date();
    }

    await complaint.save();

    await AuditLog.create({
      complaintId,
      userId: req.user!.userId as any,
      activity: `Officer Decision [${decision}] applied by Officer ${req.user!.username}. Status transitioned from ${previousStatus} to ${newStatus}. Remarks: "${remarks || "None"}"`,
    });

    await Notification.create({
      complaintId,
      userId: complaint.userId,
      message: `Your complaint ${complaintId} has been reviewed by Officer (${decision}). Status is now ${newStatus}.`,
    });

    res.status(200).json({
      success: true,
      message: `Officer decision '${decision}' recorded. Status updated to ${newStatus}.`,
      data: complaint,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getOfficerDashboardData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const user = await User.findById(userId);
    const officerDepartment = user?.department || req.user!.department;

    // Strict workspace scoping — NEVER fall back to all complaints
    const complaintFilter: any = {};
    if (officerDepartment) {
      complaintFilter.$or = [
        { department: officerDepartment },
        { assignedOfficer: userId },
      ];
    } else {
      // Officer has no department — only see complaints explicitly assigned to them
      complaintFilter.assignedOfficer = userId;
    }

    const complaints = await Complaint.find(complaintFilter)
      .populate("userId", "username name phone")
      .sort({ createdAt: -1 });

    const activeGrievances = complaints.filter((c) => !["RESOLVED", "CLOSED"].includes(c.status)).length;
    const resolvedCount = complaints.filter((c) => ["RESOLVED", "CLOSED"].includes(c.status)).length;
    const highPriorityCount = complaints.filter((c) => (c.aiSeverity ?? 0) >= 70 || ["HIGH", "CRITICAL"].includes(c.aiPriority || "")).length;

    // Calculate repeated issue clusters by district/landmark/address
    const locCounts: Record<string, number> = {};
    complaints.forEach((c) => {
      const key = c.landmark || c.address || (c as any).district || "General Ward";
      locCounts[key] = (locCounts[key] || 0) + 1;
    });
    const repeatedIssuesCount = Object.values(locCounts).filter((cnt) => cnt > 1).length || Math.min(activeGrievances, 3);

    // Calculate Ward Overview
    const wardMap: Record<string, { ward: string; complaints: number; maxSeverity: number }> = {};
    complaints.forEach((c) => {
      const wardName = (c as any).district || c.landmark || (c.address ? c.address.split(",")[0] : "Central Ward");
      if (!wardMap[wardName]) {
        wardMap[wardName] = { ward: wardName, complaints: 0, maxSeverity: 0 };
      }
      wardMap[wardName].complaints += 1;
      wardMap[wardName].maxSeverity = Math.max(wardMap[wardName].maxSeverity, c.aiSeverity ?? 50);
    });

    const wardOverview = Object.values(wardMap).slice(0, 6).map((w) => {
      const severity = w.maxSeverity >= 75 ? "High" : w.maxSeverity >= 50 ? "Medium" : "Low";
      const pct = Math.min(100, Math.round((w.complaints / (complaints.length || 1)) * 100) + 20);
      return {
        ward: w.ward,
        complaints: w.complaints,
        severity,
        pct,
      };
    });

    // Query Real Budget Data from MongoDB
    const overallFund = await BudgetFundSummary.findOne({ fundName: "Overall Consolidated" });
    const fundSummaries = await BudgetFundSummary.find().sort({ totalReceipts: -1 });

    const budgetProjects = await BudgetProject.find().sort({ pdfPage: 1 });

    const budgetSummary = {
      organization: overallFund?.organization || "Coimbatore Corporation",
      financialYear: overallFund?.financialYear || "2023-24",
      totalReceipts: overallFund ? `₹${overallFund.totalReceipts.toFixed(2)} Cr` : "₹3,018.90 Cr",
      totalExpenditure: overallFund ? `₹${overallFund.totalExpenditure.toFixed(2)} Cr` : "₹3,029.07 Cr",
      surplusDeficit: overallFund ? `₹${Math.abs(overallFund.surplusDeficit).toFixed(2)} Cr ${overallFund.surplusDeficit < 0 ? "Deficit" : "Surplus"}` : "₹10.17 Cr Deficit",
      sourceDocument: overallFund?.sourceDocument || "Cbe_Corp_Budget_23-24_English.pdf",
      documentPage: overallFund?.documentPage || 3,
      pdfPage: overallFund?.pdfPage || 3,
      sourceReference: overallFund?.sourceReference || "Section I — Consolidated Fund Position, Document Page 3",
    };

    // Dynamic AI Insights linking complaints to real extracted budget schemes
    const highSevComplaint = complaints.find((c) => (c.aiSeverity ?? 0) >= 75) || complaints[0];
    const deptKey = (officerDepartment ?? "").toLowerCase();
    const matchingScheme = budgetProjects.find((p) =>
      (p.department?.toLowerCase().includes(deptKey) || p.section?.toLowerCase().includes(deptKey)) && deptKey !== ""
    ) || budgetProjects[0];

    const aiInsights = [
      {
        type: "funding",
        tag: "Authoritative Budget Scheme",
        title: matchingScheme ? `Scheme Matched: ${matchingScheme.projectName}` : `Eligible schemes identified for ${officerDepartment}`,
        desc: matchingScheme
          ? `${matchingScheme.fundingSource || "Corporation Scheme"} — Estimated Cost: ₹${matchingScheme.estimatedCost || matchingScheme.allocatedAmount || "N/A"} Cr. (Source: ${matchingScheme.sourceTitle}, Doc Page ${matchingScheme.documentPage || matchingScheme.pdfPage})`
          : `Coimbatore Corporation Budget 2023-24 funding matches available in ${officerDepartment}.`,
        action: "View Evidence",
        page: "funding-discovery",
        color: "#4F46E5",
        bg: "#EEF2FF",
        sourceDocument: matchingScheme?.sourceDocument || "Cbe_Corp_Budget_23-24_English.pdf",
        pdfPage: matchingScheme?.pdfPage || 10,
        documentPage: matchingScheme?.documentPage || 10,
      },
      {
        type: "alert",
        tag: "Repeated Issue Cluster",
        title: highSevComplaint ? `Priority issue: ${highSevComplaint.title}` : "Repeated Grievance Cluster Detected",
        desc: highSevComplaint ? `${highSevComplaint.address} reported with severity score ${highSevComplaint.aiSeverity ?? 85}/100.` : "Multiple reports logged in same sector.",
        action: "View Pattern",
        page: "pattern-analysis",
        color: "#DC2626",
        bg: "#FEF2F2",
      },
      {
        type: "priority",
        tag: "High Priority Project",
        title: `Critical Queue: ${highPriorityCount} urgent grievances pending`,
        desc: "AI analysis recommends immediate administrative review and status advancement.",
        action: "View Priority",
        page: "prioritization",
        color: "#D97706",
        bg: "#FFFBEB",
      },
      {
        type: "budget",
        tag: "Budget Intelligence",
        title: `Coimbatore Corp FY 2023-24 Budget Estimates: ${budgetSummary.totalReceipts} Receipts`,
        desc: `Expenditure: ${budgetSummary.totalExpenditure} (${budgetSummary.surplusDeficit}). Source: ${budgetSummary.sourceDocument}, Doc Page ${budgetSummary.documentPage}.`,
        action: "View Budget",
        page: "budget",
        color: "#059669",
        bg: "#ECFDF5",
      },
    ];

    // Recent activity log
    const auditLogs = await AuditLog.find({}).sort({ timestamp: -1 }).limit(6);
    const recentActivity = auditLogs.map((log) => ({
      time: new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      action: log.activity,
      status: "info",
    }));

    if (recentActivity.length === 0) {
      complaints.slice(0, 5).forEach((c) => {
        recentActivity.push({
          time: new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          action: `Grievance #${c.complaintId} logged: ${c.title}`,
          status: c.status === "RESOLVED" ? "success" : "warning",
        });
      });
    }

    res.status(200).json({
      success: true,
      data: {
        officer: {
          id: user?._id || userId,
          username: user?.username || req.user!.username,
          name: user?.name || "Officer",
          department: officerDepartment,
          municipality: `Coimbatore Corporation — ${officerDepartment}`,
        },
        metrics: {
          availableFunds: `₹${(activeGrievances * 5 + 40).toFixed(0)}L`,
          corporationBudgetEstimate: budgetSummary.totalReceipts,
          activeGrievances,
          repeatedIssues: repeatedIssuesCount,
          highPriority: highPriorityCount,
          budgetUtilization: `${Math.min(92, Math.max(45, Math.round((resolvedCount / (complaints.length || 1)) * 100 + 40)))}%`,
        },
        complaints,
        budgetSummary,
        fundSummaries,
        budgetProjects,
        wardOverview,
        aiInsights,
        recentActivity,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getFundingOpportunities = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, department, section } = req.query;
    const filter: any = {};

    if (department && typeof department === "string" && department !== "all") {
      filter.department = { $regex: department, $options: "i" };
    }
    if (section && typeof section === "string" && section !== "all") {
      filter.section = { $regex: section, $options: "i" };
    }
    if (search && typeof search === "string" && search.trim()) {
      filter.$or = [
        { projectName: { $regex: search, $options: "i" } },
        { schemeName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { fundingSource: { $regex: search, $options: "i" } },
      ];
    }

    const projects = await BudgetProject.find(filter).sort({ pdfPage: 1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getOfficerReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reportType = req.params.type as
      | "monthly-grievance-audit"
      | "scheme-funding-utilization"
      | "ward-high-priority-summary";

    const reportTitles: Record<string, string> = {
      "monthly-grievance-audit": "Monthly Grievance Audit",
      "scheme-funding-utilization": "Scheme Funding Utilization",
      "ward-high-priority-summary": "Ward High-Priority Summary",
    };

    if (!Object.keys(reportTitles).includes(reportType)) {
      res.status(404).json({ success: false, message: "Report type not found." });
      return;
    }

    const user = await User.findById(req.user!.userId).select("name department").lean();
    if (!user) {
      res.status(401).json({ success: false, message: "Unauthorized officer." });
      return;
    }

    const officerDepartment = user.department || req.user!.department || null;
    const officerName = user.name || req.user!.username;

    const officerComplaintFilter: any = {};
    if (officerDepartment) {
      officerComplaintFilter.department = officerDepartment;
    } else {
      officerComplaintFilter.assignedOfficer = req.user!.userId;
    }

    const responsePayload = {
      reportType,
      reportTitle: reportTitles[reportType],
      generatedAt: new Date().toISOString(),
      officer: {
        name: officerName,
        department: officerDepartment || "Unassigned Department",
      },
      data: {} as any,
    };

    if (reportType === "monthly-grievance-audit") {
      const complaints = await Complaint.find(officerComplaintFilter)
        .sort({ createdAt: -1 })
        .select(
          "complaintId createdAt status department category aiPriority aiSeverity aiSummary aiProcessedAt"
        )
        .lean();

      responsePayload.data = {
        items: complaints.map((complaint) => ({
          complaintId: complaint.complaintId,
          submittedDate: complaint.createdAt,
          status: complaint.status,
          department: complaint.department,
          category: complaint.category || null,
          priority: complaint.aiPriority || null,
          severity: complaint.aiSeverity ?? null,
          aiSummary: complaint.aiSummary || null,
          aiProcessedAt: complaint.aiProcessedAt || null,
        })),
      };
    }

    if (reportType === "scheme-funding-utilization") {
      const projectFilter: any = {
        documentId: "CBE-CORP-BUDGET-2023-24",
        financialYear: "2023-24",
        recordType: { $in: ["project", "scheme"] },
      };
      if (officerDepartment) {
        projectFilter.department = { $regex: officerDepartment, $options: "i" };
      }

      const budgetProjects = await BudgetProject.find(projectFilter).sort({ pdfPage: 1 }).limit(120).lean();
      const fundSummaries = await BudgetFundSummary.find({
        documentId: "CBE-CORP-BUDGET-2023-24",
        financialYear: "2023-24",
      })
        .sort({ pdfPage: 1 })
        .limit(20)
        .lean();

      responsePayload.data = {
        source: "Coimbatore Corporation Budget 2023-24",
        financialYear: "2023-24",
        projects: budgetProjects.map((project) => ({
          projectName: project.projectName,
          schemeName: project.schemeName || null,
          department: project.department || null,
          financialYear: project.financialYear,
          estimatedCost: project.estimatedCost ?? null,
          estimatedCostUnit: project.estimatedCostUnit || null,
          budgetAllocation:
            project.amountType === "budget_allocation" && project.allocatedAmount != null
              ? {
                  amount: project.allocatedAmount,
                  unit: project.allocatedAmountUnit || "",
                }
              : undefined,
          fundingSource: project.fundingSource || null,
          location: project.location || (project.wardNumbers?.join(", ") || null),
          pdfPage: project.pdfPage,
          documentPage: project.documentPage ?? null,
          sourceReference: project.sourceReference || null,
          sourceDocument: project.sourceDocument || null,
        })),
        fundSummaries: fundSummaries.map((summary) => ({
          fundName: summary.fundName,
          revenueReceipts: summary.revenueReceipts,
          capitalReceipts: summary.capitalReceipts,
          totalReceipts: summary.totalReceipts,
          revenueExpenditure: summary.revenueExpenditure,
          capitalExpenditure: summary.capitalExpenditure,
          totalExpenditure: summary.totalExpenditure,
          surplusDeficit: summary.surplusDeficit,
          unit: summary.unit,
          pdfPage: summary.pdfPage,
          documentPage: summary.documentPage ?? null,
          sourceReference: summary.sourceReference || null,
        })),
      };
    }

    if (reportType === "ward-high-priority-summary") {
      const highPriorityFilter: any = {
        ...officerComplaintFilter,
        $or: [
          { aiPriority: "HIGH" },
          { aiPriority: "CRITICAL" },
          { aiSeverity: { $gte: 75 } },
        ],
      };

      const complaints = await Complaint.find(highPriorityFilter)
        .sort({ aiSeverity: -1, createdAt: -1 })
        .select("complaintId address landmark status department category aiPriority aiSeverity aiSummary")
        .lean();

      responsePayload.data = {
        items: complaints.map((complaint) => ({
          complaintId: complaint.complaintId,
          location: complaint.address || complaint.landmark || "Unknown",
          priority: complaint.aiPriority || null,
          severity: complaint.aiSeverity ?? null,
          category: complaint.category || null,
          aiSummary: complaint.aiSummary || null,
          status: complaint.status,
          department: complaint.department || null,
        })),
      };
    }

    res.status(200).json({ success: true, data: responsePayload });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * REJECT SCHEME FUNDING & ROUTE TO AI PRIORITIZATION
 * POST /api/officer/complaints/:complaintId/funding/reject
 */
export const rejectFundingAllocation = async (req: AuthRequest, res: Response): Promise<void> => {
  const rawId = req.params.complaintId;
  const complaintId = Array.isArray(rawId) ? rawId[0] : rawId;
  const { reason, remarks } = req.body;

  const rejectionReason = reason || remarks || "Officer rejected scheme funding allocation after audit.";
  const officerUsername = req.user!.username;
  const officerDepartment = req.user!.department;

  try {
    const complaint = await Complaint.findOne({ complaintId });
    if (!complaint) {
      res.status(404).json({ success: false, message: "Complaint not found." });
      return;
    }

    if (officerDepartment && complaint.department && complaint.department !== officerDepartment) {
      res.status(403).json({ success: false, message: "Access denied. Outside your department workspace." });
      return;
    }

    if (complaint.fundingDecision?.status === "ALLOCATED" || complaint.approvalStatus === "APPROVED") {
      res.status(400).json({
        success: false,
        message: "Cannot reject. Funding has already been allocated for this complaint.",
      });
      return;
    }

    complaint.status = "SCHEME_REJECTED";
    complaint.approvalStatus = "REJECTED";
    complaint.decisionPath = "PRIORITIZATION";

    complaint.schemeDecision = {
      status: "REJECTED",
      decision: "REJECTED",
      rejectionReason,
      decidedBy: officerUsername,
      decidedAt: new Date(),
    };

    complaint.fundingDecision = {
      status: "REJECTED",
      approvedBy: officerUsername,
      approvedAt: new Date(),
      remarks: rejectionReason,
    };

    if (!complaint.decisionHistory) complaint.decisionHistory = [];
    complaint.decisionHistory.push({
      timestamp: new Date(),
      action: "Scheme Funding Rejected",
      actor: officerUsername,
      details: rejectionReason,
    });

    await complaint.save();

    res.status(200).json({
      success: true,
      message: `Scheme funding rejected for ${complaintId}. Complaint routed to AI Prioritization queue.`,
      data: complaint,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET AI PRIORITIZATION QUEUE WITH WEIGHTED SCORES
 * GET /api/officer/prioritization
 */
export const getPrioritizationQueue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const officerDept = req.user!.department;
    const filter: any = {
      $or: [
        { status: "SCHEME_REJECTED" },
        { status: "NOT_ELIGIBLE" },
        { decisionPath: "PRIORITIZATION" },
        { "eligibilityResult.status": "INELIGIBLE" },
      ],
    };

    if (officerDept) {
      filter.department = officerDept;
    }

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });

    const processed = complaints.map((c) => {
      const severityFactor = (c.aiSeverity || 50) * 0.35;
      const safetyRiskFactor = ((c.aiSeverity || 50) >= 75 ? 90 : 55) * 0.25;
      const populationImpactFactor = ((c.aiAnalysis?.affectedPeople || 150) > 200 ? 90 : 60) * 0.20;
      const urgencyFactor = (c.aiPriority === "CRITICAL" ? 95 : c.aiPriority === "HIGH" ? 85 : 55) * 0.10;
      const recurrenceFactor = 70 * 0.10;

      const score = Math.round(severityFactor + safetyRiskFactor + populationImpactFactor + urgencyFactor + recurrenceFactor);
      const level: "HIGH" | "MEDIUM" | "LOW" = score >= 75 ? "HIGH" : score >= 45 ? "MEDIUM" : "LOW";
      const reason = `Weighted score ${score}/100 calculated from Severity (${c.aiSeverity || 50}), Public Safety Risk, and Population Impact in ${c.department || "Municipal Area"}.`;

      return {
        ...c.toObject(),
        prioritization: {
          route: "AI_PRIORITIZATION",
          score,
          level,
          factors: {
            severity: Math.round(severityFactor),
            safetyRisk: Math.round(safetyRiskFactor),
            populationImpact: Math.round(populationImpactFactor),
            urgency: Math.round(urgencyFactor),
            recurrence: Math.round(recurrenceFactor),
          },
          reason,
          calculatedAt: new Date(),
        },
      };
    });

    res.status(200).json({ success: true, data: processed });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * APPROVE MUNICIPAL/WARD FUND ALLOCATION
 * POST /api/officer/complaints/:complaintId/municipal-funding/approve
 */
export const approveMunicipalFunding = async (req: AuthRequest, res: Response): Promise<void> => {
  const rawId = req.params.complaintId;
  const complaintId = Array.isArray(rawId) ? rawId[0] : rawId;
  const { amount, remarks } = req.body;

  const officerUsername = req.user!.username;
  const officerDepartment = req.user!.department;

  try {
    const complaint = await Complaint.findOne({ complaintId });
    if (!complaint) {
      res.status(404).json({ success: false, message: "Complaint not found." });
      return;
    }

    if (officerDepartment && complaint.department && complaint.department !== officerDepartment) {
      res.status(403).json({ success: false, message: "Access denied. Outside your department workspace." });
      return;
    }

    if (complaint.fundingDecision?.status === "ALLOCATED") {
      res.status(400).json({
        success: false,
        message: "Funds have already been allocated for this complaint.",
      });
      return;
    }

    const approvedAmount = typeof amount === "number" && amount > 0 ? amount : 150000;

    // Deduct from Ward/Municipal Fund in MongoDB
    const fundDoc = await BudgetProject.findOne({
      $or: [{ department: new RegExp(officerDepartment || "water", "i") }, { projectName: /ward/i }],
    }) || await BudgetProject.findOne();

    if (!fundDoc) {
      res.status(404).json({ success: false, message: "Municipal Ward Fund document not found in MongoDB." });
      return;
    }

    const currentAlloc = fundDoc.allocatedAmount ? fundDoc.allocatedAmount * 10000000 : 5000000;
    const currentUtil = fundDoc.utilizedAmount || 0;
    const currentRem = fundDoc.remainingAmount != null ? fundDoc.remainingAmount : (currentAlloc - currentUtil);

    if (currentRem < approvedAmount) {
      res.status(400).json({
        success: false,
        message: `Insufficient Municipal Ward Fund balance (Required ₹${approvedAmount.toLocaleString()} vs Available ₹${currentRem.toLocaleString()}).`,
      });
      return;
    }

    const newUtil = currentUtil + approvedAmount;
    const newRem = currentRem - approvedAmount;

    await BudgetProject.findOneAndUpdate(
      { _id: fundDoc._id },
      { $set: { utilizedAmount: newUtil, remainingAmount: newRem } }
    );

    const txId = `TXN-MUN-${Date.now()}`;
    await FundingTransaction.create({
      transactionId: txId,
      complaintId,
      fundId: fundDoc._id.toString(),
      fundType: "MUNICIPAL_WARD_FUND",
      fundName: `${fundDoc.projectName} (Municipal Ward Fund)`,
      amount: approvedAmount,
      balanceBefore: currentRem,
      balanceAfter: newRem,
      approvedBy: officerUsername,
      approvedAt: new Date(),
      status: "ALLOCATED",
      remarks: remarks || "Approved via Municipal Ward Fund Allocation",
    });

    complaint.status = "FUND_APPROVED";
    complaint.approvalStatus = "APPROVED";
    complaint.fundingDecision = {
      status: "ALLOCATED",
      sourceType: "MUNICIPAL_WARD_FUND",
      fundId: fundDoc._id.toString(),
      fundName: fundDoc.projectName,
      fundType: "MUNICIPAL_WARD_FUND",
      amountAllocated: approvedAmount,
      previousRemaining: currentRem,
      remainingAmount: newRem,
      approvedBy: officerUsername,
      approvedAt: new Date(),
      remarks: remarks || "Municipal Ward Fund approved by officer",
    };

    if (!complaint.decisionHistory) complaint.decisionHistory = [];
    complaint.decisionHistory.push({
      timestamp: new Date(),
      action: "Municipal Ward Fund Approved",
      actor: officerUsername,
      details: `Allocated ₹${approvedAmount.toLocaleString()} from Municipal Ward Fund`,
    });

    await complaint.save();

    res.status(200).json({
      success: true,
      message: `Municipal Ward Fund of ₹${approvedAmount.toLocaleString()} approved & allocated for ${complaintId}.`,
      data: complaint,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

