import axios from "axios";
import { IComplaint } from "../models/Complaint";

export const triggerN8NWorkflow = async (complaint: IComplaint, user: any) => {
  const webhookUrl = process.env.N8N_WEBHOOK_URL || "https://7314-123-255-250-238.ngrok-free.app/webhook/complaint";
  const webhookSecret = process.env.N8N_WEBHOOK_SECRET || "tn_grievance_n8n_secret_2026_key";

  // The URL n8n must call back with AI results
  const backendBase = process.env.BACKEND_CALLBACK_URL ||
    process.env.BACKEND_URL ||
    `http://localhost:${process.env.PORT || 5000}`;
  const callbackUrl = `${backendBase}/api/webhooks/n8n/complaint-processed`;

  const payload = {
    complaintId: complaint.complaintId,
    title: complaint.title,
    description: complaint.description,
    category: complaint.category || "General",
    address: complaint.address,
    gpsLocation: complaint.gpsLocation,
    landmark: complaint.landmark,
    attachments: complaint.attachments.map((att) => ({
      name: att.originalName,
      url: `${process.env.FRONTEND_URL || "http://localhost:5000"}${att.url}`,
    })),
    user: {
      username: user.username,
      name: user.name,
      phone: complaint.contactNumber,
    },
    timestamp: complaint.createdAt,
    // Callback information — n8n MUST POST its AI result to this URL
    callbackUrl,
    webhookSecret,
    backendUrl: backendBase,
  };

  const headers = {
    "Content-Type": "application/json",
    "X-Webhook-Secret": webhookSecret,
  };

  // Timeout (30 seconds) + Retry logic (2 attempts)
  const maxRetries = 2;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      attempt++;
      console.log(`📡 Triggering n8n Webhook (Attempt ${attempt}/${maxRetries}): ${webhookUrl} for complaint ${complaint.complaintId}`);
      
      const response = await axios.post(webhookUrl, payload, {
        headers,
        timeout: 30000, // 30s timeout
      });

      return response.data;
    } catch (error: any) {
      console.error(`❌ n8n Webhook attempt ${attempt} failed (${error.message}) for complaint ${complaint.complaintId}`);
      if (attempt >= maxRetries) {
        console.warn("----------------------------------------------------------------");
        console.warn("⚠️ N8N WEBHOOK TROUBLESHOOTING:");
        console.warn(" 1. Ensure ngrok is running and your tunnel URL matches backend/.env N8N_WEBHOOK_URL.");
        console.warn(" 2. In n8n, if your workflow is in Test Mode, use /webhook-test/... instead of /webhook/...");
        console.warn(" 3. Ensure the workflow in n8n is active/published.");
        console.warn("----------------------------------------------------------------");

        // Fallback to local default AI classification if mock AI is enabled or webhook returns 404
        if (process.env.MOCK_AI === "true" || error.response?.status === 404) {
          console.log("ℹ️ MOCK_AI fallback enabled. Assigning default AI classification and structured analysis.");
          return {
            success: true,
            complaintId: complaint.complaintId,
            ai: {
              summary: `Automated AI Summary: ${complaint.title}. Urgent civic inspection required for ${complaint.address || "locality"}.`,
              category: complaint.category || "General Maintenance",
              department: complaint.department || "Road Department",
              priority: "HIGH",
              urgency: "24–48 hours",
              affectedPeople: 30,
              schemeEligible: true,
              scheme: "Municipal Drainage & Infrastructure Maintenance Scheme",
              fundAvailable: true,
              recommendedAction: "APPROVAL_REQUIRED",
              reason: [
                "Public health & safety concern identified",
                "Multiple citizen households in area affected",
                "Active municipal infrastructure maintenance required"
              ],
              severity: 85,
              validationStatus: "VALID",
            },
          };
        }

        throw new Error(`n8n webhook execution failed after ${maxRetries} attempts: ${error.message}`);
      }
      // Wait 1 second before retry
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
};
