import mongoose, { Schema, Document } from "mongoose";

export interface IBudgetProject extends Document {
  sourceKey: string;
  documentId: string;
  sourceDocument: string;
  sourceTitle: string;
  sourceType: string;
  organization: string;
  state: string;
  recordType: "project" | "scheme" | "program_metric" | "infrastructure_metric";
  amountType?: "estimated_cost" | "budget_allocation" | "actual" | "revised_estimate" | "grant" | "loan" | "revenue" | "expenditure";
  projectName: string;
  schemeName?: string;
  section?: string;
  department?: string;
  description?: string;
  financialYear: string;
  estimatedCost?: number | null;
  estimatedCostUnit?: string | null;
  allocatedAmount?: number | null;
  allocatedAmountUnit?: string | null;
  utilizedAmount?: number;
  remainingAmount?: number | null;
  fundingSource?: string;
  metricName?: string;
  metricValue?: number;
  metricUnit?: string;
  location?: string;
  wardNumbers?: string[];
  zones?: string[];
  pdfPage: number;
  documentPage?: number | null;
  sourceReference?: string;
  extractionStatus: "validated" | "needs_review";
  extractedAt: Date;
  extractionVersion: string;
}

const BudgetProjectSchema: Schema = new Schema(
  {
    sourceKey: { type: String, required: true, unique: true, index: true },
    documentId: { type: String, required: true, default: "CBE-CORP-BUDGET-2023-24" },
    sourceDocument: { type: String, required: true, default: "Cbe_Corp_Budget_23-24_English.pdf" },
    sourceTitle: { type: String, required: true, default: "Coimbatore Corporation Budget 2023-2024" },
    sourceType: { type: String, required: true, default: "government_budget" },
    organization: { type: String, required: true, default: "Coimbatore Corporation" },
    state: { type: String, required: true, default: "Tamil Nadu" },
    recordType: {
      type: String,
      required: true,
      enum: ["project", "scheme", "program_metric", "infrastructure_metric"],
      default: "project",
    },
    amountType: {
      type: String,
      enum: ["estimated_cost", "budget_allocation", "actual", "revised_estimate", "grant", "loan", "revenue", "expenditure"],
    },
    projectName: { type: String, required: true },
    schemeName: { type: String },
    section: { type: String },
    department: { type: String },
    description: { type: String },
    financialYear: { type: String, required: true, default: "2023-24" },
    estimatedCost: { type: Number, default: null },
    estimatedCostUnit: { type: String, default: null },
    allocatedAmount: { type: Number, default: null },
    allocatedAmountUnit: { type: String, default: null },
    utilizedAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: null },
    fundingSource: { type: String },
    metricName: { type: String },
    metricValue: { type: Number },
    metricUnit: { type: String },
    location: { type: String },
    wardNumbers: [{ type: String }],
    zones: [{ type: String }],
    pdfPage: { type: Number, required: true },
    documentPage: { type: Number, default: null },
    sourceReference: { type: String },
    extractionStatus: { type: String, required: true, enum: ["validated", "needs_review"], default: "validated" },
    extractedAt: { type: Date, default: Date.now },
    extractionVersion: { type: String, default: "1.0" },
  },
  { timestamps: true }
);

export const BudgetProject = mongoose.model<IBudgetProject>("BudgetProject", BudgetProjectSchema);
