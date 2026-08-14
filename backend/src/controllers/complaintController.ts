import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { Complaint, IAttachment } from "../models/Complaint";
import { User } from "../models/User";
import { AuditLog, Notification } from "../models/Workflow";
import { triggerN8NWorkflow } from "../services/n8nService";
import { sendOfficerEmailNotification } from "../services/emailService";
import { resolveAIDepartment, resolveOfficerForDepartment } from "../utils/departmentResolver";
import { Types } from "mongoose";

export const createComplaint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, category, department, address, gpsLocation, landmark, contactNumber, complaintId: customComplaintId } = req.body;

    const rawDescription = typeof description === "string" ? description.trim() : "";

    // Process attachments from Multer
    const attachments: IAttachment[] = [];
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file: Express.Multer.File) => {
        attachments.push({
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url: `/uploads/complaints/${file.filename}`,
        });
      });
    }

    const hasDescription = rawDescription.length > 0;
    const hasDocument = attachments.length > 0;

    if (!title || !address || !contactNumber) {
      res.status(400).json({ success: false, message: "Title, address, and contact number are required." });
      return;
    }

    // Server-Side Validation: Accept description-only, PDF-only, or description+PDF
    if (!hasDescription && !hasDocument) {
      res.status(400).json({
        success: false,
        message: "Please describe your complaint or upload a supporting document.",
      });
      return;
    }

    // Complaint ID handling: Allow supplied complaintId for controlled testing/admin, otherwise generate TN-2026-XXXXXX
    let complaintId = customComplaintId ? String(customComplaintId).trim() : "";
    if (complaintId) {
      const existing = await Complaint.findOne({ complaintId });
      if (existing) {
        res.status(400).json({ success: false, message: `Complaint ID '${complaintId}' already exists in database.` });
        return;
      }
    } else {
      let attempts = 0;
      const count = await Complaint.countDocuments();
      let candidateNum = count + 1;
      while (attempts < 100) {
        const candidateId = `TN-2026-${String(candidateNum).padStart(6, "0")}`;
        const exists = await Complaint.findOne({ complaintId: candidateId });
        if (!exists) {
          complaintId = candidateId;
          break;
        }
        candidateNum++;
        attempts++;
      }
      if (!complaintId) {
        complaintId = `TN-2026-${Date.now()}`;
      }
    }

    const targetDept = department || category || "Road Department";

    const complaint = await Complaint.create({
      complaintId,
      userId: req.user!.userId,
      title,
      description: rawDescription, // Stores original citizen description exactly, or "" if PDF only
      category,
      department: targetDept,
      address,
      gpsLocation,
      landmark,
      contactNumber,
      attachments,
      status: "AI_PROCESSING",
    });

    await AuditLog.create({
      complaintId,
      userId: req.user!.userId as any,
      activity: "Complaint submitted by citizen and sent for AI processing",
    });

    // Lookup assigned officer recipient from MongoDB
    const assignedOfficer = await User.findOne({
      role: "officer",
      $or: [
        { department: targetDept },
        { department: new RegExp(targetDept.split(" ")[0] || "", "i") },
      ],
    });

    const officerEmail = assignedOfficer?.email || "ganesh@municipality.gov";
    const officerName = assignedOfficer?.name || assignedOfficer?.username || "Officer";

    // Non-blocking officer email notification via EmailJS
    sendOfficerEmailNotification(targetDept, complaint.toObject()).catch((err) => {
      console.error("Non-blocking email error:", err.message);
    });

    // Trigger n8n AI Workflow
    triggerN8NWorkflow(complaint, req.user)
      .then(async (result) => {
        const aiData = result.ai || result;

        // Only persist what n8n actually returned
        if (aiData.summary != null)          complaint.aiSummary          = aiData.summary;
        if (aiData.category != null)         complaint.aiCategory         = aiData.category;
        if (aiData.priority != null)         complaint.aiPriority         = aiData.priority;
        if (aiData.severity != null)         complaint.aiSeverity         = Number(aiData.severity);
        if (aiData.confidence != null)       complaint.aiConfidence       = Number(aiData.confidence);
        if (aiData.issue != null)            complaint.aiIssue            = String(aiData.issue);
        if (aiData.validationStatus != null) complaint.aiValidationStatus = aiData.validationStatus;

        // Department resolution: normalize AI dept to canonical officer department
        const rawAiDept = aiData.department ?? null;
        const canonicalDept = await resolveAIDepartment(rawAiDept);
        if (aiData.department != null) complaint.aiDepartment = rawAiDept;
        if (canonicalDept) complaint.department = canonicalDept;

        // Build structured aiAnalysis subdocument
        const structuredAnalysis: Record<string, any> = { ...complaint.aiAnalysis };
        if (aiData.summary != null) structuredAnalysis.summary = String(aiData.summary);
        if (aiData.category != null) structuredAnalysis.category = String(aiData.category);
        if (aiData.department != null) structuredAnalysis.department = String(aiData.department);
        if (aiData.priority != null) structuredAnalysis.priority = String(aiData.priority);
        if (aiData.urgency != null) structuredAnalysis.urgency = String(aiData.urgency);
        if (aiData.affectedPeople != null) structuredAnalysis.affectedPeople = Number(aiData.affectedPeople);
        if (aiData.schemeEligible != null) structuredAnalysis.schemeEligible = Boolean(aiData.schemeEligible);
        if (aiData.scheme != null) structuredAnalysis.scheme = String(aiData.scheme);
        if (aiData.recommendedAction != null) structuredAnalysis.recommendedAction = String(aiData.recommendedAction);
        if (aiData.confidence != null) structuredAnalysis.confidence = Number(aiData.confidence);
        if (aiData.issue != null) structuredAnalysis.issue = String(aiData.issue);
        if (aiData.classification != null) structuredAnalysis.classification = String(aiData.classification);
        if (Array.isArray(aiData.reason)) structuredAnalysis.reason = aiData.reason;
        else if (typeof aiData.reason === "string") structuredAnalysis.reason = [aiData.reason];

        complaint.aiAnalysis = structuredAnalysis as any;

        // Officer assignment
        const { officerId, officerName } = await resolveOfficerForDepartment(canonicalDept);
        if (officerId) {
          complaint.assignedOfficer = new Types.ObjectId(officerId) as any;
        }

        complaint.aiProcessedAt = new Date();
        complaint.status = "AI_PROCESSED";
        await complaint.save();

        const assignmentLabel = canonicalDept
          ? officerName ? `${canonicalDept} (Officer: ${officerName})` : canonicalDept
          : "the relevant department";

        await AuditLog.create({
          complaintId,
          userId: req.user!.userId as any,
          activity: `Complaint analyzed by AI and assigned to ${assignmentLabel}`,
        });

        await Notification.create({
          complaintId,
          userId: req.user!.userId as any,
          message: `Your complaint ${complaintId} has been assigned to ${assignmentLabel}.`,
        });

        // Re-notify officer with full AI summary & priority
        sendOfficerEmailNotification(canonicalDept || complaint.department || "", complaint.toObject()).catch((err) => {
          console.error("Non-blocking post-AI email error:", err.message);
        });
      })
      .catch(async (err) => {
        console.error("AI trigger processing failed:", err.message);

        complaint.status = "AI_PROCESSING_FAILED";
        complaint.aiValidationStatus = "PROCESSING_FAILED";
        await complaint.save();

        await AuditLog.create({
          complaintId,
          userId: req.user!.userId as any,
          activity: `AI processing failed: ${err.message}`,
        });
      });

    res.status(201).json({
      success: true,
      message: "Grievance submitted successfully. Forwarded to municipal department officer.",
      data: {
        ...complaint.toObject(),
        assignedOfficerEmail: officerEmail,
        assignedOfficerName: officerName,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Failed to create complaint." });
  }
};

export const getMyComplaints = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const complaints = await Complaint.find({ userId: req.user!.userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: complaints });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getComplaintById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { complaintId } = req.params;
    const complaint = await Complaint.findOne({ complaintId }).populate("userId", "username name phone");

    if (!complaint) {
      res.status(404).json({ success: false, message: "Complaint not found." });
      return;
    }

    // Citizen Isolation: Citizen can ONLY view their own complaint
    if (req.user!.role === "citizen" && complaint.userId._id.toString() !== req.user!.userId) {
      res.status(403).json({ success: false, message: "Access denied. You cannot view complaints belonging to another citizen." });
      return;
    }

    // Officer Isolation: Officer can ONLY view complaints assigned to their department
    if (req.user!.role === "officer" && req.user!.department && complaint.department !== req.user!.department) {
      res.status(403).json({ success: false, message: "Access denied. Outside your assigned department." });
      return;
    }

    const auditLogs = await AuditLog.find({ complaintId }).sort({ timestamp: 1 });

    res.status(200).json({
      success: true,
      data: {
        complaint,
        timeline: auditLogs,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const reprocessComplaint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { complaintId } = req.params;
    const complaint = await Complaint.findOne({ complaintId }).populate("userId", "username name phone");

    if (!complaint) {
      res.status(404).json({ success: false, message: "Complaint not found." });
      return;
    }

    complaint.status = "AI_PROCESSING";
    await complaint.save();

    triggerN8NWorkflow(complaint, req.user)
      .then(async (result) => {
        const aiData = result.ai || result;
        const deptName = aiData.department;

        // Only persist what n8n actually returned
        if (aiData.summary != null)          complaint.aiSummary          = aiData.summary;
        if (aiData.category != null)         complaint.aiCategory         = aiData.category;
        if (deptName != null) {
          complaint.aiDepartment = deptName;
          complaint.department   = deptName;
        }
        if (aiData.priority != null)         complaint.aiPriority         = aiData.priority;
        if (aiData.severity != null)         complaint.aiSeverity         = Number(aiData.severity);
        if (aiData.validationStatus != null) complaint.aiValidationStatus = aiData.validationStatus;
        complaint.aiProcessedAt = new Date();
        complaint.status = "AI_PROCESSED";
        await complaint.save();

        await AuditLog.create({
          complaintId,
          userId: req.user!.userId as any,
          activity: `Complaint reprocessed by AI and assigned to ${deptName}`,
        });
      })
      .catch(async (err) => {
        console.error("Reprocessing failed:", err.message);
        complaint.status = "AI_PROCESSING_FAILED";
        await complaint.save();
      });

    res.status(200).json({ success: true, message: "AI reprocessing initiated.", data: complaint });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const analyzeComplaintPreview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, category, address, gpsLocation, landmark } = req.body;

    const tempComplaint: any = {
      complaintId: `PREVIEW-${Date.now()}`,
      title: title || "Grievance Preview",
      description: description || "",
      category: category || "General",
      address: address || "Chennai, Tamil Nadu",
      gpsLocation: gpsLocation || { latitude: 13.0827, longitude: 80.2707 },
      landmark: landmark || "",
      attachments: [],
      contactNumber: (req.user as any)?.phone || "0000000000",
      createdAt: new Date(),
    };

    const result = await triggerN8NWorkflow(tempComplaint, req.user || { username: "citizen_preview", name: "Citizen" });
    const aiData = result?.ai || result?.data?.output || result?.output || result;

    const output = {
      summary: aiData.summary || `AI Preview Summary: Urgent civic inspection needed for ${tempComplaint.title}.`,
      issue: aiData.issue || tempComplaint.category || "Civic Infrastructure Maintenance",
      department: aiData.department || "Road Department",
      reason: Array.isArray(aiData.reason) ? aiData.reason.join("; ") : (aiData.reason || "Public health & safety concern identified."),
    };

    res.status(200).json({
      success: true,
      data: {
        output,
      },
    });
  } catch (err: any) {
    console.error("AI preview proxy error:", err.message);
    res.status(500).json({ success: false, message: err.message || "Failed to analyze complaint via backend proxy." });
  }
};

