import { Schema, model, Document, Types } from "mongoose";

export interface IAttachment {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
}

export interface IAIAnalysis {
  summary?: string;
  category?: string;
  department?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  urgency?: string;
  affectedPeople?: number;
  schemeEligible?: boolean;
  scheme?: string;
  fundAvailable?: boolean;
  recommendedAction?: "APPROVAL_REQUIRED" | "REJECT_INVALID" | "CLARIFICATION_NEEDED" | "FORWARD_TO_DEPT";
  reason?: string[];
  confidence?: number;
  issue?: string;
  classification?: string;
}

export interface IOfficerDecision {
  decision: "APPROVED" | "REJECTED" | "CLARIFICATION_REQUESTED";
  remarks?: string;
  decidedAt: Date;
  decidedBy: string;
}

export interface IFundingDecision {
  status: "ALLOCATED" | "PENDING" | "REJECTED" | "NEEDS_REVIEW";
  sourceType?: "GOVERNMENT_SCHEME" | "MUNICIPAL_WARD_FUND";
  fundId?: string;
  fundName?: string;
  fundType?: string;
  amountAllocated?: number;
  previousRemaining?: number;
  remainingAmount?: number;
  approvedBy?: string;
  approvedAt?: Date;
  remarks?: string;
}

export interface ISchemeMatchCandidate {
  schemeId?: string;
  schemeName: string;
  schemeLevel?: "STATE" | "CENTRAL";
  department?: string;
  matchScore: number;
  confidence: number;
  reason: string;
  eligibilityCriteria: string[];
  source?: string;
  sourcePage?: string;
  requiredAmount: number;
  availableFund: number;
  fundAvailable: boolean;
}

export interface ISchemeAnalysis {
  analyzedAt: Date;
  eligible: boolean;
  matches: ISchemeMatchCandidate[];
  selectedSchemeId?: string;
  selectedSchemeName?: string;
  confidence?: number;
  reason?: string;
}

export interface ISchemeDecision {
  status?: "APPROVED" | "REJECTED" | "PENDING";
  decision?: string;
  rejectionReason?: string;
  decidedBy?: string;
  decidedAt?: Date;
}

export interface IPrioritization {
  route?: string;
  score: number;
  level: "HIGH" | "MEDIUM" | "LOW";
  factors?: {
    severity: number;
    safetyRisk: number;
    populationImpact: number;
    urgency: number;
    recurrence: number;
  };
  reason: string;
  calculatedAt: Date;
}

export interface IComplaint extends Document {
  complaintId: string;
  userId: Types.ObjectId;
  title: string;
  description: string;
  category?: string;
  address: string;
  gpsLocation?: {
    latitude?: number;
    longitude?: number;
  } | string;
  latitude?: number;
  longitude?: number;
  landmark?: string;
  attachments: IAttachment[];
  contactNumber: string;

  // Structured AI Analysis
  aiAnalysis?: IAIAnalysis;
  aiSummary?: string;
  aiCategory?: string;
  aiDepartment?: string;
  aiPriority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  aiSeverity?: number;
  aiConfidence?: number;
  aiIssue?: string;
  aiValidationStatus?: "VALID" | "NEEDS_REVIEW" | "INVALID" | "PROCESSING_FAILED";
  aiProcessedAt?: Date;

  // Decision Pipeline & Audit Schema Fields
  decisionPath?: "SCHEME_APPROVAL" | "PRIORITIZATION" | "OFFICER_REVIEW";
  schemeMatch?: {
    matched: boolean;
    schemeId?: string;
    schemeName?: string;
    matchReason?: string;
    confidence?: number;
  };
  eligibilityResult?: {
    status: "ELIGIBLE" | "INELIGIBLE" | "VERIFICATION_REQUIRED";
    criteria?: string[];
    missingCriteria?: string[];
  };
  fundingCheck?: {
    status: "AVAILABLE" | "INSUFFICIENT_FUNDS" | "UNVERIFIED";
    requiredAmount?: number;
    availableAmount?: number;
  };
  priorityResult?: {
    score: number;
    level: string;
    reason: string;
  };
  approvalStatus?: "PENDING_OFFICER" | "APPROVED" | "REJECTED" | "NEEDS_REVIEW";

  // Extended Formal Audit Subdocuments
  schemeAnalysis?: ISchemeAnalysis;
  schemeDecision?: ISchemeDecision;
  fundingDecision?: IFundingDecision;
  prioritization?: IPrioritization;

  decisionHistory?: Array<{
    timestamp: Date;
    action: string;
    actor: string;
    details?: string;
  }>;

  // Workflow & Decision
  department?: string;
  status:
    | "SUBMITTED"
    | "AI_PROCESSING"
    | "AI_PROCESSED"
    | "ASSIGNED"
    | "UNDER_REVIEW"
    | "IN_PROGRESS"
    | "SCHEME_REJECTED"
    | "NOT_ELIGIBLE"
    | "FUND_APPROVED"
    | "RESOLVED"
    | "CLOSED"
    | "AI_PROCESSING_FAILED";
  officerDecision?: IOfficerDecision;
  officerRemarks?: string;
  resolutionProof?: IAttachment[];
  assignedOfficer?: Types.ObjectId;
  closedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema = new Schema<IAttachment>({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  url: { type: String, required: true },
});

const AIAnalysisSchema = new Schema<IAIAnalysis>({
  summary: { type: String },
  category: { type: String },
  department: { type: String },
  priority: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
  urgency: { type: String },
  affectedPeople: { type: Number },
  schemeEligible: { type: Boolean },
  scheme: { type: String },
  fundAvailable: { type: Boolean },
  recommendedAction: { type: String },
  reason: [{ type: String }],
  confidence: { type: Number },
  issue: { type: String },
  classification: { type: String },
});

const OfficerDecisionSchema = new Schema<IOfficerDecision>({
  decision: { type: String, enum: ["APPROVED", "REJECTED", "CLARIFICATION_REQUESTED"] },
  remarks: { type: String },
  decidedAt: { type: Date, default: Date.now },
  decidedBy: { type: String },
});

const DecisionHistorySchema = new Schema({
  timestamp: { type: Date, default: Date.now },
  action: { type: String, required: true },
  actor: { type: String, required: true },
  details: { type: String },
});

const FundingDecisionSchema = new Schema<IFundingDecision>({
  status: { type: String, enum: ["ALLOCATED", "PENDING", "REJECTED", "NEEDS_REVIEW"], default: "PENDING" },
  sourceType: { type: String, enum: ["GOVERNMENT_SCHEME", "MUNICIPAL_WARD_FUND"] },
  fundId: { type: String },
  fundName: { type: String },
  fundType: { type: String },
  amountAllocated: { type: Number },
  previousRemaining: { type: Number },
  remainingAmount: { type: Number },
  approvedBy: { type: String },
  approvedAt: { type: Date, default: Date.now },
  remarks: { type: String },
});

const SchemeMatchCandidateSchema = new Schema<ISchemeMatchCandidate>({
  schemeId: { type: String },
  schemeName: { type: String, required: true },
  schemeLevel: { type: String, enum: ["STATE", "CENTRAL"], default: "STATE" },
  department: { type: String },
  matchScore: { type: Number, required: true },
  confidence: { type: Number, required: true },
  reason: { type: String, required: true },
  eligibilityCriteria: [{ type: String }],
  source: { type: String },
  sourcePage: { type: String },
  requiredAmount: { type: Number, required: true },
  availableFund: { type: Number, required: true },
  fundAvailable: { type: Boolean, required: true },
});

const SchemeAnalysisSchema = new Schema<ISchemeAnalysis>({
  analyzedAt: { type: Date, default: Date.now },
  eligible: { type: Boolean, required: true },
  matches: [SchemeMatchCandidateSchema],
  selectedSchemeId: { type: String },
  selectedSchemeName: { type: String },
  confidence: { type: Number },
  reason: { type: String },
});

const SchemeDecisionSchema = new Schema<ISchemeDecision>({
  status: { type: String, enum: ["APPROVED", "REJECTED", "PENDING"], default: "PENDING" },
  decision: { type: String },
  rejectionReason: { type: String },
  decidedBy: { type: String },
  decidedAt: { type: Date, default: Date.now },
});

const PrioritizationSchema = new Schema<IPrioritization>({
  route: { type: String, default: "AI_PRIORITIZATION" },
  score: { type: Number, required: true },
  level: { type: String, enum: ["HIGH", "MEDIUM", "LOW"], required: true },
  factors: {
    severity: { type: Number },
    safetyRisk: { type: Number },
    populationImpact: { type: Number },
    urgency: { type: Number },
    recurrence: { type: Number },
  },
  reason: { type: String, required: true },
  calculatedAt: { type: Date, default: Date.now },
});

const ComplaintSchema = new Schema<IComplaint>(
  {
    complaintId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    category: { type: String },
    address: { type: String, required: true },
    gpsLocation: { type: Schema.Types.Mixed },
    latitude: { type: Number },
    longitude: { type: Number },
    landmark: { type: String },
    attachments: [AttachmentSchema],
    contactNumber: { type: String, required: true },

    aiAnalysis: AIAnalysisSchema,
    aiSummary: { type: String },
    aiCategory: { type: String },
    aiDepartment: { type: String },
    aiPriority: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
    aiSeverity: { type: Number },
    aiConfidence: { type: Number },
    aiIssue: { type: String },
    aiValidationStatus: { type: String, enum: ["VALID", "NEEDS_REVIEW", "INVALID", "PROCESSING_FAILED"] },
    aiProcessedAt: { type: Date },

    decisionPath: { type: String, enum: ["SCHEME_APPROVAL", "PRIORITIZATION", "OFFICER_REVIEW"] },
    schemeMatch: {
      matched: { type: Boolean, default: false },
      schemeId: { type: String },
      schemeName: { type: String },
      matchReason: { type: String },
      confidence: { type: Number },
    },
    eligibilityResult: {
      status: { type: String, enum: ["ELIGIBLE", "INELIGIBLE", "VERIFICATION_REQUIRED"] },
      criteria: [{ type: String }],
      missingCriteria: [{ type: String }],
    },
    fundingCheck: {
      status: { type: String, enum: ["AVAILABLE", "INSUFFICIENT_FUNDS", "UNVERIFIED"] },
      requiredAmount: { type: Number },
      availableAmount: { type: Number },
    },
    priorityResult: {
      score: { type: Number },
      level: { type: String },
      reason: { type: String },
    },
    approvalStatus: { type: String, enum: ["PENDING_OFFICER", "APPROVED", "REJECTED", "NEEDS_REVIEW"], default: "PENDING_OFFICER" },

    schemeAnalysis: SchemeAnalysisSchema,
    schemeDecision: SchemeDecisionSchema,
    fundingDecision: FundingDecisionSchema,
    prioritization: PrioritizationSchema,

    decisionHistory: [DecisionHistorySchema],

    department: { type: String, index: true },
    status: {
      type: String,
      enum: [
        "SUBMITTED",
        "AI_PROCESSING",
        "AI_PROCESSED",
        "ASSIGNED",
        "UNDER_REVIEW",
        "IN_PROGRESS",
        "SCHEME_REJECTED",
        "NOT_ELIGIBLE",
        "FUND_APPROVED",
        "RESOLVED",
        "CLOSED",
        "AI_PROCESSING_FAILED",
      ],
      default: "SUBMITTED",
      index: true,
    },
    officerDecision: OfficerDecisionSchema,
    officerRemarks: { type: String },
    resolutionProof: [AttachmentSchema],
    assignedOfficer: { type: Schema.Types.ObjectId, ref: "User" },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

export const Complaint = model<IComplaint>("Complaint", ComplaintSchema);
