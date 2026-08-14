import express from "express";
import { createComplaint, getMyComplaints, getComplaintById, reprocessComplaint, analyzeComplaintPreview } from "../controllers/complaintController";
import { requireAuth, requireRole } from "../middleware/authMiddleware";
import { upload } from "../middleware/uploadMiddleware";

const router = express.Router();

router.post("/analyze", requireAuth, analyzeComplaintPreview);
router.post("/", requireAuth, requireRole("citizen"), upload.array("attachments", 5), createComplaint);
router.get("/my", requireAuth, requireRole("citizen"), getMyComplaints);
router.get("/:complaintId", requireAuth, getComplaintById);
router.post("/:complaintId/reprocess", requireAuth, reprocessComplaint);

export default router;
