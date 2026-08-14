import express from "express";
import { registerCitizen, loginCitizen, loginOfficer, getMe } from "../controllers/authController";
import { createComplaint, getMyComplaints, getComplaintById } from "../controllers/complaintController";
import {
  getOfficerComplaints,
  updateComplaintStatus,
  addOfficerRemarks,
  uploadResolutionProof,
  getOfficerDashboardData,
  getFundingOpportunities,
  getComplaintDecisionEndpoint,
  evaluateComplaintDecisionEndpoint,
  decideComplaint,
  approveFundingAllocation,
  rejectFundingAllocation,
  getPrioritizationQueue,
  approveMunicipalFunding,
  getFundingTransactions,
} from "../controllers/officerController";
import { getDepartments, getNotifications, getDashboardStats, handleN8NWebhookProcessed } from "../controllers/workflowController";
import { askOfficerAIAssistant } from "../controllers/aiAssistantController";
import { getPatternAnalysis, getRootCauseAnalysis, getSolutionRecommendations, verifyRootCause } from "../controllers/patternController";
import {
  getWorkforceOverview,
  assignTaskToWorker,
  updateWorkerTaskStatus,
  addWorkforceOfficer,
  addWorkforceWorker,
  updateWorkforceWorkerStatus,
  getCitizenTrackingInfo,
} from "../controllers/workforceController";
import { requireAuth, requireRole } from "../middleware/authMiddleware";
import { upload } from "../middleware/uploadMiddleware";

const router = express.Router();

// Auth Routes (Citizen & Officer Username / Password)
router.post("/auth/citizen/register", registerCitizen);
router.post("/auth/citizen/login", loginCitizen);
router.post("/auth/officer/login", loginOfficer);
router.get("/auth/me", requireAuth, getMe);

// Citizen Complaint Routes & Tracking
router.post("/complaints", requireAuth, requireRole("citizen"), upload.array("attachments", 5), createComplaint);
router.get("/complaints/my", requireAuth, requireRole("citizen"), getMyComplaints);
router.get("/complaints/:complaintId", requireAuth, getComplaintById);
router.get("/track/:complaintId", getCitizenTrackingInfo);
router.get("/complaints/track/:complaintId", getCitizenTrackingInfo);

// Officer Routes
router.get("/officer/dashboard", requireAuth, requireRole("officer"), getOfficerDashboardData);
router.get("/officer/funding", requireAuth, requireRole("officer"), getFundingOpportunities);
router.get("/officer/funding/transactions", requireAuth, requireRole("officer"), getFundingTransactions);
router.post("/officer/ai-assistant", requireAuth, requireRole("officer"), askOfficerAIAssistant);
router.get("/officer/pattern-analysis", requireAuth, requireRole("officer"), getPatternAnalysis);
router.post("/officer/root-cause", requireAuth, requireRole("officer"), getRootCauseAnalysis);
router.post("/officer/root-cause/verify", requireAuth, requireRole("officer"), verifyRootCause);
router.get("/officer/solution-recommendations", requireAuth, requireRole("officer"), getSolutionRecommendations);
router.get("/officer/prioritization", requireAuth, requireRole("officer"), getPrioritizationQueue);
router.get("/officer/complaints", requireAuth, requireRole("officer"), getOfficerComplaints);
router.get("/officer/complaints/:complaintId", requireAuth, requireRole("officer"), getComplaintById);
router.get("/officer/complaints/:complaintId/decision", requireAuth, requireRole("officer"), getComplaintDecisionEndpoint);
router.post("/officer/complaints/:complaintId/evaluate", requireAuth, requireRole("officer"), evaluateComplaintDecisionEndpoint);
router.post("/officer/complaints/:complaintId/approve-funding", requireAuth, requireRole("officer"), approveFundingAllocation);
router.post("/officer/complaints/:complaintId/funding/approve", requireAuth, requireRole("officer"), approveFundingAllocation);
router.post("/officer/complaints/:complaintId/funding/reject", requireAuth, requireRole("officer"), rejectFundingAllocation);
router.post("/officer/complaints/:complaintId/municipal-funding/approve", requireAuth, requireRole("officer"), approveMunicipalFunding);

// Workforce Management Routes
router.get("/officer/workforce", requireAuth, getWorkforceOverview);
router.post("/officer/workforce/assign", requireAuth, assignTaskToWorker);
router.post("/officer/workforce/update-task", requireAuth, updateWorkerTaskStatus);
router.post("/officer/workforce/officer/add", requireAuth, addWorkforceOfficer);
router.post("/officer/workforce/worker/add", requireAuth, addWorkforceWorker);
router.post("/officer/workforce/worker/status", requireAuth, updateWorkforceWorkerStatus);
router.post("/officer/complaints/:complaintId/decision", requireAuth, requireRole("officer"), decideComplaint);
router.patch("/officer/complaints/:complaintId/status", requireAuth, requireRole("officer"), updateComplaintStatus);
router.post("/officer/complaints/:complaintId/remarks", requireAuth, requireRole("officer"), addOfficerRemarks);
router.post("/officer/complaints/:complaintId/resolution-proof", requireAuth, requireRole("officer"), upload.array("proof", 5), uploadResolutionProof);

// Workflow, Webhook & Utility Routes
router.post("/webhooks/n8n/complaint-processed", handleN8NWebhookProcessed);
router.get("/departments", getDepartments);
router.get("/notifications", requireAuth, getNotifications);
router.get("/dashboard/stats", getDashboardStats);
router.get("/dashboard/public-stats", getDashboardStats);

export default router;
