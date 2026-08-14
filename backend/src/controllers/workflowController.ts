import { Request, Response } from "express";
import { Department, Notification } from "../models/Workflow";
import { Complaint } from "../models/Complaint";
import { AuthRequest } from "../middleware/authMiddleware";
import { resolveAIDepartment, resolveOfficerForDepartment } from "../utils/departmentResolver";
import { autoAssignWorkerForComplaint } from "./workforceController";
import { Types } from "mongoose";

export const getDepartments = async (req: Request, res: Response): Promise<void> => {
  try {
    const departments = await Department.find();
    res.status(200).json({ success: true, data: departments });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notifications = await Notification.find({ userId: req.user!.userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: notifications });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const resolvedComplaints = await Complaint.countDocuments({ status: { $in: ["RESOLVED", "CLOSED"] } });
    const pendingComplaints = await Complaint.countDocuments({ status: { $nin: ["RESOLVED", "CLOSED"] } });

    const depts = await Department.countDocuments();

    // Calculate real average resolution time
    const resolvedList = await Complaint.find({ status: { $in: ["RESOLVED", "CLOSED"] }, closedAt: { $exists: true } });
    let totalDays = 0;
    resolvedList.forEach((c) => {
      if (c.closedAt) {
        const diffMs = new Date(c.closedAt).getTime() - new Date(c.createdAt).getTime();
        totalDays += diffMs / (1000 * 60 * 60 * 24);
      }
    });

    const averageResolutionDays = resolvedList.length > 0 ? (totalDays / resolvedList.length).toFixed(1) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalComplaints,
        resolved: resolvedComplaints,
        pending: pendingComplaints,
        averageResolutionDays: Number(averageResolutionDays),
        departmentsConnected: depts || 10,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const handleN8NWebhookProcessed = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("[N8N CALLBACK INCOMING]", JSON.stringify(req.body, null, 2));

    // 1. Secret header / body validation
    const secretHeader = (req.headers["x-webhook-secret"] as string) || req.body.webhookSecret || req.query.secret;
    const expectedSecret = process.env.N8N_WEBHOOK_SECRET || "tn_grievance_n8n_secret_2026_key";
    if (secretHeader && secretHeader !== expectedSecret) {
      console.warn(`[N8N CALLBACK WARNING] Secret mismatch. Received: "${secretHeader}", Expected: "${expectedSecret}"`);
      res.status(401).json({ success: false, message: "Unauthorized webhook request. Invalid X-Webhook-Secret header or secret parameter." });
      return;
    }

    // 2. Extract complaintId from top-level or nested objects
    const body = req.body || {};
    const targetId =
      body.complaintId ||
      body.complaint_id ||
      body.id ||
      body.ai?.complaintId ||
      body.data?.complaintId ||
      body.result?.complaintId ||
      body.output?.complaintId;

    if (!targetId) {
      console.error("[N8N CALLBACK ERROR] No complaintId found in payload:", body);
      res.status(400).json({ success: false, message: "complaintId is required in callback payload." });
      return;
    }

    const complaint = await Complaint.findOne({ complaintId: targetId });
    if (!complaint) {
      console.error(`[N8N CALLBACK ERROR] Complaint not found for complaintId: "${targetId}"`);
      res.status(404).json({ success: false, message: `Complaint with id ${targetId} not found.` });
      return;
    }

    // 3. Extract AI payload across all potential n8n nesting locations
    const sources = [body.ai, body.data, body.result, body.output, body].filter(Boolean);
    
    const findField = (keys: string[]): any => {
      for (const src of sources) {
        for (const k of keys) {
          if (src[k] != null && src[k] !== "") return src[k];
        }
      }
      return undefined;
    };

    const rawSummary = findField(["aiSummary", "summary", "text", "description", "content"]);
    const rawCategory = findField(["aiCategory", "category", "classification"]);
    const rawDept = findField(["aiDepartment", "department", "dept"]);
    const rawPriority = findField(["aiPriority", "priority", "urgencyLevel"]);
    const rawSeverity = findField(["aiSeverity", "severity", "score"]);
    const rawValidation = findField(["aiValidationStatus", "validationStatus", "validation"]);
    const rawUrgency = findField(["urgency", "turnaroundTime"]);
    const rawAffected = findField(["affectedPeople", "affectedCount"]);
    const rawScheme = findField(["scheme", "matchedScheme"]);
    const rawAction = findField(["recommendedAction", "action"]);
    const rawReason = findField(["reason", "reasons", "analysisReasons"]);
    const rawConfidence = findField(["confidence", "scoreConfidence", "aiConfidence"]);
    const rawIssue = findField(["issue", "problem", "title"]);

    // 4. Update AI Summary and core AI fields
    if (rawSummary != null) complaint.aiSummary = String(rawSummary);
    if (rawCategory != null) complaint.aiCategory = String(rawCategory);
    if (rawPriority != null) complaint.aiPriority = String(rawPriority).toUpperCase() as any;
    if (rawSeverity != null) complaint.aiSeverity = Number(rawSeverity);
    if (rawConfidence != null) complaint.aiConfidence = Number(rawConfidence);
    if (rawIssue != null) complaint.aiIssue = String(rawIssue);
    if (rawValidation != null) complaint.aiValidationStatus = String(rawValidation).toUpperCase() as any;

    // 5. Construct aiAnalysis sub-document
    const structuredAnalysis: Record<string, any> = complaint.aiAnalysis ? (complaint.aiAnalysis as any).toObject?.() || { ...complaint.aiAnalysis } : {};
    if (rawSummary != null) structuredAnalysis.summary = String(rawSummary);
    if (rawCategory != null) structuredAnalysis.category = String(rawCategory);
    if (rawDept != null) structuredAnalysis.department = String(rawDept);
    if (rawPriority != null) structuredAnalysis.priority = String(rawPriority).toUpperCase();
    if (rawUrgency != null) structuredAnalysis.urgency = String(rawUrgency);
    if (rawAffected != null) structuredAnalysis.affectedPeople = Number(rawAffected);
    if (rawScheme != null) structuredAnalysis.scheme = String(rawScheme);
    if (rawAction != null) structuredAnalysis.recommendedAction = String(rawAction);
    if (rawConfidence != null) structuredAnalysis.confidence = Number(rawConfidence);
    if (rawIssue != null) structuredAnalysis.issue = String(rawIssue);
    if (Array.isArray(rawReason) && rawReason.length > 0) {
      structuredAnalysis.reason = rawReason;
    } else if (typeof rawReason === "string" && rawReason.trim().length > 0) {
      structuredAnalysis.reason = [rawReason.trim()];
    }

    if (Object.keys(structuredAnalysis).length > 0) {
      complaint.aiAnalysis = structuredAnalysis as any;
    }

    // 6. Resolve department & officer assignment
    const canonicalDept = await resolveAIDepartment(rawDept);
    if (rawDept != null) complaint.aiDepartment = String(rawDept);
    if (canonicalDept) complaint.department = canonicalDept;

    const { officerId, officerName } = await resolveOfficerForDepartment(canonicalDept || complaint.department || null);
    if (officerId) {
      complaint.assignedOfficer = new Types.ObjectId(officerId) as any;
    }

    // 7. Validate AI result presence and update status
    const hasValidAiResult = Boolean(rawSummary || rawDept || rawCategory || rawPriority || rawReason);

    if (hasValidAiResult && rawValidation !== "PROCESSING_FAILED") {
      complaint.aiProcessedAt = new Date();
      complaint.status = "AI_PROCESSED";
      if (!complaint.aiValidationStatus) {
        complaint.aiValidationStatus = "VALID";
      }
    } else {
      complaint.status = "AI_PROCESSING_FAILED";
      complaint.aiValidationStatus = "PROCESSING_FAILED";
    }

    await complaint.save();

    // 8. Trigger Automatic Worker Assignment Pipeline
    await autoAssignWorkerForComplaint(complaint).catch((err) => {
      console.warn("⚠️ Non-blocking autoAssignWorkerForComplaint warning:", err.message);
    });

    console.log(`[N8N CALLBACK SUCCESS] Updated ${targetId}: status=AI_PROCESSED, aiSummary="${complaint.aiSummary?.substring(0, 50)}...", dept="${complaint.department}", officer="${officerName || 'unassigned'}"`);

    // 8. Create Notification for citizen
    const assignmentLabel = canonicalDept
      ? officerName
        ? `${canonicalDept} (Officer: ${officerName})`
        : canonicalDept
      : "the relevant department";

    await Notification.create({
      complaintId: targetId,
      userId: complaint.userId,
      message: `Your complaint ${targetId} has been analyzed by AI and assigned to ${assignmentLabel}.`,
    }).catch(() => { /* non-blocking */ });

    res.status(200).json({
      success: true,
      complaintId: targetId,
      status: "AI_PROCESSED",
      message: "N8N AI analysis successfully persisted into MongoDB Complaint.",
      data: complaint,
    });
  } catch (err: any) {
    console.error("[N8N CALLBACK FATAL ERROR]", err);
    res.status(500).json({ success: false, message: err.message || "Failed to process n8n callback" });
  }
};
