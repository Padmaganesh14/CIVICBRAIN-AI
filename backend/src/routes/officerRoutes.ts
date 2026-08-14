import express from "express";
import {
  getOfficerComplaints,
  updateComplaintStatus,
  addOfficerRemarks,
  uploadResolutionProof,
  decideComplaint,
  getOfficerDashboardData,
  getFundingOpportunities,
  getOfficerReport,
  getComplaintDecisionEndpoint,
  evaluateComplaintDecisionEndpoint,
  approveFundingAllocation,
  rejectFundingAllocation,
  getPrioritizationQueue,
  approveMunicipalFunding,
  getFundingTransactions,
} from "../controllers/officerController";
import { getComplaintById } from "../controllers/complaintController";
import { requireAuth, requireRole } from "../middleware/authMiddleware";
import { upload } from "../middleware/uploadMiddleware";
import { askOfficerAIAssistant } from "../controllers/aiAssistantController";
import { getPatternAnalysis, getRootCauseAnalysis, getSolutionRecommendations, verifyRootCause } from "../controllers/patternController";
import {
  getWorkforceOverview,
  assignTaskToWorker,
  updateWorkerTaskStatus,
  addWorkforceOfficer,
  addWorkforceWorker,
  updateWorkforceWorkerStatus,
} from "../controllers/workforceController";

const router = express.Router();

router.get("/dashboard", requireAuth, requireRole("officer"), getOfficerDashboardData);
router.get("/funding", requireAuth, requireRole("officer"), getFundingOpportunities);
router.get("/funding/transactions", requireAuth, requireRole("officer"), getFundingTransactions);
router.get("/reports/:type", requireAuth, requireRole("officer"), getOfficerReport);
router.post("/ai-assistant", requireAuth, requireRole("officer"), askOfficerAIAssistant);
router.get("/pattern-analysis", requireAuth, requireRole("officer"), getPatternAnalysis);
router.post("/root-cause", requireAuth, requireRole("officer"), getRootCauseAnalysis);
router.post("/root-cause/verify", requireAuth, requireRole("officer"), verifyRootCause);
router.get("/solution-recommendations", requireAuth, requireRole("officer"), getSolutionRecommendations);
router.get("/prioritization", requireAuth, requireRole("officer"), getPrioritizationQueue);
router.get("/complaints", requireAuth, requireRole("officer"), getOfficerComplaints);
router.get("/complaints/:complaintId", requireAuth, requireRole("officer"), getComplaintById);
router.patch("/complaints/:complaintId/status", requireAuth, requireRole("officer"), updateComplaintStatus);
router.get("/complaints/:complaintId/decision", requireAuth, requireRole("officer"), getComplaintDecisionEndpoint);
router.post("/complaints/:complaintId/evaluate", requireAuth, requireRole("officer"), evaluateComplaintDecisionEndpoint);
router.post("/complaints/:complaintId/approve-funding", requireAuth, requireRole("officer"), approveFundingAllocation);
router.post("/complaints/:complaintId/funding/approve", requireAuth, requireRole("officer"), approveFundingAllocation);
router.post("/complaints/:complaintId/funding/reject", requireAuth, requireRole("officer"), rejectFundingAllocation);
router.post("/complaints/:complaintId/municipal-funding/approve", requireAuth, requireRole("officer"), approveMunicipalFunding);
router.post("/complaints/:complaintId/decision", requireAuth, requireRole("officer"), decideComplaint);
router.post("/complaints/:complaintId/remarks", requireAuth, requireRole("officer"), addOfficerRemarks);
router.post(
  "/complaints/:complaintId/resolution-proof",
  requireAuth,
  requireRole("officer"),
  upload.array("proof", 5),
  uploadResolutionProof
);

// Workforce Management Routes
router.get("/workforce", requireAuth, getWorkforceOverview);
router.post("/workforce/assign", requireAuth, assignTaskToWorker);
router.post("/workforce/update-task", requireAuth, updateWorkerTaskStatus);
router.post("/workforce/officer/add", requireAuth, addWorkforceOfficer);
router.post("/workforce/worker/add", requireAuth, addWorkforceWorker);
router.post("/workforce/worker/status", requireAuth, updateWorkforceWorkerStatus);

export default router;
