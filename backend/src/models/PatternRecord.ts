import { Schema, model, Document } from "mongoose";

export interface IRootCauseAnalysis {
  confirmedFacts: string[];
  evidence: string[];
  likelyRootCause: string;
  confidence: number;
  alternativeCauses: string[];
  verificationRequired: string[];
}

export interface IScalableSolution {
  title: string;
  utility: string;
}

export interface IRecommendedActions {
  immediate: string[];
  shortTerm: string[];
  longTerm: string[];
  scalable: IScalableSolution[] | string[];
}

export interface IPatternRecord extends Document {
  patternId: string;
  issueType: string;
  department: string;
  area: string;
  ward?: string;
  zone?: string;
  complaintCount: number;
  threshold: number;
  timeWindowDays: number;
  firstComplaintDate: Date;
  latestComplaintDate: Date;
  complaintIds: string[];
  severity: "High" | "Medium" | "Low";
  status: "Detected" | "Root Cause Identified" | "Verified" | "Resolved";
  rootCauseStatus: "Pending Analysis" | "Analyzed" | "Verified" | "Rejected";
  
  rootCauseAnalysis?: IRootCauseAnalysis;
  recommendedActions?: IRecommendedActions;
  
  officerRemarks?: string;
  verifiedBy?: string;
  verifiedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const RootCauseAnalysisSchema = new Schema<IRootCauseAnalysis>({
  confirmedFacts: [{ type: String }],
  evidence: [{ type: String }],
  likelyRootCause: { type: String, required: true },
  confidence: { type: Number, required: true, default: 85 },
  alternativeCauses: [{ type: String }],
  verificationRequired: [{ type: String }],
});

const RecommendedActionsSchema = new Schema({
  immediate: [{ type: String }],
  shortTerm: [{ type: String }],
  longTerm: [{ type: String }],
  scalable: [{ type: Schema.Types.Mixed }],
});

const PatternRecordSchema = new Schema<IPatternRecord>(
  {
    patternId: { type: String, required: true, unique: true, index: true },
    issueType: { type: String, required: true },
    department: { type: String, required: true, index: true },
    area: { type: String, required: true, index: true },
    ward: { type: String },
    zone: { type: String },
    complaintCount: { type: Number, required: true, default: 3 },
    threshold: { type: Number, required: true, default: 3 },
    timeWindowDays: { type: Number, required: true, default: 30 },
    firstComplaintDate: { type: Date, required: true, default: Date.now },
    latestComplaintDate: { type: Date, required: true, default: Date.now },
    complaintIds: [{ type: String }],
    severity: { type: String, enum: ["High", "Medium", "Low"], default: "High" },
    status: { type: String, enum: ["Detected", "Root Cause Identified", "Verified", "Resolved"], default: "Detected" },
    rootCauseStatus: { type: String, enum: ["Pending Analysis", "Analyzed", "Verified", "Rejected"], default: "Pending Analysis" },

    rootCauseAnalysis: RootCauseAnalysisSchema,
    recommendedActions: RecommendedActionsSchema,

    officerRemarks: { type: String },
    verifiedBy: { type: String },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

export const PatternRecord = model<IPatternRecord>("PatternRecord", PatternRecordSchema);
