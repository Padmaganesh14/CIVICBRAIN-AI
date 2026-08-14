import express from "express";
import { getDepartments, getNotifications, getDashboardStats, handleN8NWebhookProcessed } from "../controllers/workflowController";
import { requireAuth } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/departments", getDepartments);
router.get("/notifications", requireAuth, getNotifications);
router.get("/dashboard/stats", getDashboardStats);
router.post("/webhooks/n8n/complaint-processed", handleN8NWebhookProcessed);

export default router;
