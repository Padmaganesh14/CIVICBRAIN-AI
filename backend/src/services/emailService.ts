import axios from "axios";
import { User } from "../models/User";
import { Department } from "../models/Workflow";

export const sendOfficerEmailNotification = async (department: string, complaintDetails: any) => {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  try {
    const targetDept = department || complaintDetails.department || complaintDetails.category || "Road Department";

    // 1. Dynamic MongoDB lookup: Find officer assigned to this department in users collection
    let officer = await User.findOne({
      role: "officer",
      $or: [
        { department: targetDept },
        { department: new RegExp(targetDept.split(" ")[0] || "", "i") },
      ],
    });

    let recipientEmail = officer?.email;
    let officerName = officer?.name || officer?.username || "Officer";

    // 2. Fallback to Department collection in MongoDB if User record email is missing
    if (!recipientEmail) {
      const deptDoc = await Department.findOne({
        $or: [
          { departmentName: targetDept },
          { departmentName: new RegExp(targetDept.split(" ")[0] || "", "i") },
        ],
      });
      if (deptDoc?.officerEmail) {
        recipientEmail = deptDoc.officerEmail;
      }
    }

    if (!recipientEmail) {
      recipientEmail = "ganesh@municipality.gov";
    }

    if (!serviceId || !templateId || !publicKey) {
      console.log(`✉️ EmailJS keys not configured in backend/.env. (Simulating email dispatch to officer ${recipientEmail} [${officerName}] for complaint ${complaintDetails.complaintId})`);
      return { success: true, recipientEmail, officerName, simulated: true };
    }

    await axios.post("https://api.emailjs.com/api/v1.0/email/send", {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      accessToken: privateKey,
      template_params: {
        to_email: recipientEmail,
        officer_name: officerName,
        complaint_id: complaintDetails.complaintId,
        complaint_title: complaintDetails.title,
        complaint_description: complaintDetails.description || "PDF document attached",
        location: complaintDetails.address,
        department: targetDept,
        priority: complaintDetails.aiPriority || complaintDetails.aiAnalysis?.priority || "HIGH",
        ai_summary: complaintDetails.aiSummary || complaintDetails.title,
        recommended_action: complaintDetails.aiAnalysis?.recommendedAction || "APPROVAL_REQUIRED",
        portal_url: `${process.env.FRONTEND_URL || "http://localhost:8080"}/officer`,
      },
    });

    console.log(`✅ EmailJS notification sent to ${recipientEmail} (${officerName}) for complaint ${complaintDetails.complaintId}`);
    return { success: true, recipientEmail, officerName, simulated: false };
  } catch (err: any) {
    console.error("❌ EmailJS sending failed (complaint remains saved):", err.message);
    return { success: false, error: err.message };
  }
};
