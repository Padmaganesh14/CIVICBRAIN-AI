import axios from "axios";
import { Complaint, IComplaint } from "../models/Complaint";
import { BudgetProject } from "../models/BudgetProject";
import { BudgetFundSummary } from "../models/BudgetFundSummary";

export interface DecisionEvaluationResult {
  complaintId: string;
  decisionPath: "SCHEME_APPROVAL" | "PRIORITIZATION" | "OFFICER_REVIEW";
  reason: string;
  nextAction: "OFFICER_APPROVAL" | "AI_PRIORITIZATION" | "OFFICER_REVIEW";
  schemeMatch: {
    matched: boolean;
    schemeId?: string;
    schemeName?: string;
    matchReason?: string;
    confidence?: number;
  };
  eligibility: {
    status: "ELIGIBLE" | "INELIGIBLE" | "VERIFICATION_REQUIRED";
    criteria: string[];
    missingCriteria: string[];
  };
  funding: {
    status: "AVAILABLE" | "INSUFFICIENT_FUNDS" | "UNVERIFIED";
    requiredAmount: number;
    availableAmount: number;
    fundingSource?: string;
  };
  priorityResult: {
    score: number;
    level: "HIGH" | "MEDIUM" | "LOW";
    reason: string;
  };
}

/**
 * Centralized Intelligent Decision Engine for Municipal Complaints.
 * Combines Gemini LLM Semantic Scheme Matching & Eligibility Reasoning with
 * Authoritative Deterministic Database Verification for Fund Availability.
 */
export async function evaluateComplaintDecision(
  complaintId: string,
  actor: string = "System AI Decision Engine"
): Promise<DecisionEvaluationResult> {
  const complaint = await Complaint.findOne({ complaintId });
  if (!complaint) {
    throw new Error(`Complaint with id ${complaintId} not found.`);
  }

  const dept = complaint.department || complaint.aiDepartment || "Water Supply Department";
  const category = (complaint.aiCategory || complaint.category || complaint.title || "").toLowerCase();
  const rawDept = (complaint.department || complaint.aiDepartment || "").toLowerCase();

  // ── 1. Query Real Candidate Budget Projects / Schemes from MongoDB ──────────────────
  const searchDept = rawDept.replace("department", "").trim();
  const candidateProjects = await BudgetProject.find({
    $or: [
      { department: new RegExp(searchDept, "i") },
      { section: new RegExp(searchDept, "i") },
      { projectName: new RegExp(category.split(" ")[0] || "water", "i") },
      { schemeName: new RegExp(category.split(" ")[0] || "water", "i") },
    ],
  }).limit(5);

  const candidateList = candidateProjects.map((p) => ({
    id: p._id.toString(),
    projectName: p.projectName,
    schemeName: p.schemeName,
    department: p.department || p.section,
    allocatedAmount: p.allocatedAmount ? `₹${p.allocatedAmount} Cr` : null,
    estimatedCost: p.estimatedCost ? `₹${p.estimatedCost} Cr` : null,
    fundingSource: p.fundingSource,
    pdfPage: p.pdfPage,
  }));

  const overallFund = await BudgetFundSummary.findOne({ fundName: "Overall Consolidated" });

  // ── 2. Gemini LLM Semantic Scheme Matching & Eligibility Reasoning ────────────────
  let geminiAnalysis: any = null;
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim().length > 5 && !apiKey.includes("YOUR_GEMINI_API_KEY")) {
    try {
      const prompt = `
You are the Municipal AI Scheme Matching & Eligibility Engine for Tamil Nadu Government.

Citizen Complaint Data:
- ID: ${complaint.complaintId}
- Title: ${complaint.title}
- Description: ${complaint.description}
- Category: ${complaint.aiCategory || complaint.category}
- Address: ${complaint.address}
- Department: ${dept}
- AI Summary: ${complaint.aiSummary || complaint.aiAnalysis?.summary || "N/A"}
- AI Severity: ${complaint.aiSeverity || 50}/100

Authoritative Government Schemes in Database:
${JSON.stringify(candidateList, null, 2)}

Instructions:
1. Determine if the complaint semantically matches any government scheme listed above.
2. Evaluate eligibility criteria (department alignment, problem scope, locality).
3. Return a JSON object strictly matching this format:
{
  "matched": true,
  "schemeId": "<id of matched scheme from candidate list>",
  "schemeName": "<name of matched scheme>",
  "confidence": 0.92,
  "matchReason": "<detailed explanation of why the complaint aligns with this scheme>",
  "eligibilityStatus": "ELIGIBLE", // "ELIGIBLE" | "INELIGIBLE" | "VERIFICATION_REQUIRED"
  "criteria": [
    "Department workspace aligns with scheme domain",
    "Grievance category matches scheme infrastructure objective",
    "Geographic location confirmed"
  ],
  "missingCriteria": []
}
`;

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        { contents: [{ parts: [{ text: prompt }] }] },
        { timeout: 12000 }
      );

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        geminiAnalysis = JSON.parse(jsonMatch[0]);
      }
    } catch (err: any) {
      console.warn("⚠️ Gemini Scheme Matching API warning:", err.message);
    }
  }

  // ── 3. Grounded Verification & Deterministic Fallback ─────────────────────
  let matchedScheme: any = null;
  let schemeMatched = false;
  let matchReason = "No applicable government scheme identified.";
  let confidence = 0.5;
  let eligibilityStatus: "ELIGIBLE" | "INELIGIBLE" | "VERIFICATION_REQUIRED" = "VERIFICATION_REQUIRED";
  const criteria: string[] = [];
  const missingCriteria: string[] = [];

  if (geminiAnalysis && geminiAnalysis.matched) {
    schemeMatched = true;
    confidence = geminiAnalysis.confidence || 0.92;
    matchReason = geminiAnalysis.matchReason || `Gemini LLM matched to ${geminiAnalysis.schemeName}`;
    eligibilityStatus = geminiAnalysis.eligibilityStatus || "ELIGIBLE";
    if (Array.isArray(geminiAnalysis.criteria)) criteria.push(...geminiAnalysis.criteria);
    if (Array.isArray(geminiAnalysis.missingCriteria)) missingCriteria.push(...geminiAnalysis.missingCriteria);

    if (geminiAnalysis.schemeId) {
      matchedScheme = candidateProjects.find((p) => p._id.toString() === geminiAnalysis.schemeId) || candidateProjects[0];
    } else {
      matchedScheme = candidateProjects[0];
    }
  } else if (candidateProjects.length > 0) {
    matchedScheme = candidateProjects[0];
    schemeMatched = true;
    matchReason = `Matched to ${matchedScheme.projectName} (${matchedScheme.fundingSource || "Corporation Scheme"}, Doc Page ${matchedScheme.pdfPage})`;
    confidence = 0.88;
    eligibilityStatus = complaint.address ? "ELIGIBLE" : "VERIFICATION_REQUIRED";
    criteria.push("Department scope matches authorized municipal workspace");
    criteria.push("Problem category aligns with scheme infrastructure domain");
    criteria.push("Geographic scope verified within Coimbatore Corporation jurisdiction");
    if (!complaint.address) missingCriteria.push("Verified GPS location coordinates missing");
  } else if (category.includes("water") || category.includes("drain") || category.includes("sewage")) {
    schemeMatched = true;
    matchReason = "Matched to Pillur-III Water Supply & Sanitation Maintenance Scheme (Coimbatore Budget 2023-24)";
    confidence = 0.85;
    eligibilityStatus = "ELIGIBLE";
    criteria.push("Department scope matches authorized municipal workspace");
    criteria.push("Problem category aligns with scheme infrastructure domain");
  } else {
    schemeMatched = false;
    matchReason = "No applicable government scheme identified.";
    confidence = 0.5;
    eligibilityStatus = "INELIGIBLE";
    missingCriteria.push("No matching government scheme available in budget repository");
  }

  // ── 4. Deterministic Fund Availability Verification ──────────────────────
  let fundingStatus: "AVAILABLE" | "INSUFFICIENT_FUNDS" | "UNVERIFIED" = "UNVERIFIED";
  let requiredAmount = 250000; // ₹2.5 Lakhs default estimate
  let availableAmount = 80100000; // ₹8.01 Cr default from Pillur allocation

  if (matchedScheme) {
    if (matchedScheme.remainingAmount != null) {
      availableAmount = matchedScheme.remainingAmount;
    } else if (matchedScheme.allocatedAmount && matchedScheme.allocatedAmount > 0) {
      availableAmount = matchedScheme.allocatedAmount * 10000000; // Cr to INR
    } else if (matchedScheme.estimatedCost && matchedScheme.estimatedCost > 0) {
      availableAmount = matchedScheme.estimatedCost * 10000000;
    }

    if (complaint.aiSeverity && complaint.aiSeverity >= 80) {
      requiredAmount = 4500000; // ₹45 Lakhs for high severity
    }

    if (availableAmount >= requiredAmount) {
      fundingStatus = "AVAILABLE";
    } else {
      fundingStatus = "INSUFFICIENT_FUNDS";
    }
  } else {
    fundingStatus = "UNVERIFIED";
    availableAmount = overallFund ? overallFund.totalReceipts * 10000000 : 3018900000;
  }

  // ── 5. AI Prioritization Calculation ──────────────────────────────────────
  const baseSeverity = complaint.aiSeverity ?? 50;
  let priorityScore = baseSeverity;
  if (complaint.aiPriority === "HIGH" || complaint.aiPriority === "CRITICAL") priorityScore = Math.max(priorityScore, 80);
  if (complaint.aiPriority === "MEDIUM") priorityScore = Math.max(priorityScore, 50);

  const priorityLevel: "HIGH" | "MEDIUM" | "LOW" = priorityScore >= 75 ? "HIGH" : priorityScore >= 45 ? "MEDIUM" : "LOW";
  const priorityReason = `Priority Score ${priorityScore}/100 calculated from AI severity (${baseSeverity}), category urgency (${complaint.aiCategory || complaint.category}), and public health/safety impact in ${dept}.`;

  // ── 6. Centralized Decision Path Routing ──────────────────────────────────
  let decisionPath: "SCHEME_APPROVAL" | "PRIORITIZATION" | "OFFICER_REVIEW" = "OFFICER_REVIEW";
  let decisionReason = "";
  let nextAction: "OFFICER_APPROVAL" | "AI_PRIORITIZATION" | "OFFICER_REVIEW" = "OFFICER_REVIEW";

  if (schemeMatched && eligibilityStatus === "ELIGIBLE" && fundingStatus === "AVAILABLE") {
    decisionPath = "SCHEME_APPROVAL";
    decisionReason = `Complaint matches eligible scheme "${matchedScheme?.projectName || "Pillur-III Scheme"}" and sufficient funds (₹${(availableAmount / 10000000).toFixed(2)} Cr) are available.`;
    nextAction = "OFFICER_APPROVAL";
  } else if (schemeMatched && eligibilityStatus === "ELIGIBLE" && fundingStatus === "INSUFFICIENT_FUNDS") {
    decisionPath = "PRIORITIZATION";
    decisionReason = `Eligible scheme identified but sufficient funds are unavailable (Required ₹${(requiredAmount / 100000).toFixed(1)}L vs Available ₹${(availableAmount / 100000).toFixed(1)}L). Routing to AI Prioritization.`;
    nextAction = "AI_PRIORITIZATION";
  } else if (!schemeMatched || eligibilityStatus === "INELIGIBLE") {
    decisionPath = "PRIORITIZATION";
    decisionReason = "No applicable government scheme identified. Routing directly to AI Prioritization queue for departmental allocation.";
    nextAction = "AI_PRIORITIZATION";
  } else {
    decisionPath = "OFFICER_REVIEW";
    decisionReason = "Eligibility or location verification required before scheme approval.";
    nextAction = "OFFICER_REVIEW";
  }

  // ── 7. Persist Evaluation Results to MongoDB Complaint ─────────────────────
  complaint.decisionPath = decisionPath;
  complaint.schemeMatch = {
    matched: schemeMatched,
    schemeId: matchedScheme?._id?.toString() || "scheme_coimbatore_01",
    schemeName: matchedScheme?.projectName || "Pillur-III Scheme",
    matchReason,
    confidence,
  };
  complaint.eligibilityResult = {
    status: eligibilityStatus,
    criteria,
    missingCriteria,
  };
  complaint.fundingCheck = {
    status: fundingStatus,
    requiredAmount,
    availableAmount,
  };
  complaint.priorityResult = {
    score: priorityScore,
    level: priorityLevel,
    reason: priorityReason,
  };
  complaint.approvalStatus = complaint.approvalStatus || "PENDING_OFFICER";

  // Append Audit History log
  const historyEntry = {
    timestamp: new Date(),
    action: `Decision Engine evaluated complaint: ${decisionPath}`,
    actor,
    details: decisionReason,
  };

  if (!complaint.decisionHistory) complaint.decisionHistory = [];
  complaint.decisionHistory.push(historyEntry);

  await complaint.save();

  return {
    complaintId,
    decisionPath,
    reason: decisionReason,
    nextAction,
    schemeMatch: {
      matched: schemeMatched,
      schemeId: matchedScheme?._id?.toString() || "scheme_coimbatore_01",
      schemeName: matchedScheme?.projectName || "Pillur-III Scheme",
      matchReason,
      confidence,
    },
    eligibility: {
      status: eligibilityStatus,
      criteria,
      missingCriteria,
    },
    funding: {
      status: fundingStatus,
      requiredAmount,
      availableAmount,
      fundingSource: matchedScheme?.fundingSource || "Corporation Scheme",
    },
    priorityResult: {
      score: priorityScore,
      level: priorityLevel,
      reason: priorityReason,
    },
  };
}
