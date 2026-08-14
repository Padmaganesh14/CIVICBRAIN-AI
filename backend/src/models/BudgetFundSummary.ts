import mongoose, { Schema, Document } from "mongoose";

export interface IBudgetFundSummary extends Document {
  sourceKey: string;
  documentId: string;
  sourceDocument: string;
  sourceTitle: string;
  organization: string;
  state: string;
  financialYear: string;
  fundName: string;
  revenueReceipts: number;
  capitalReceipts: number;
  totalReceipts: number;
  revenueExpenditure: number;
  capitalExpenditure: number;
  totalExpenditure: number;
  surplusDeficit: number;
  unit: string;
  pdfPage: number;
  documentPage?: number | null;
  sourceReference?: string;
  extractionStatus: "validated" | "needs_review";
  extractedAt: Date;
  extractionVersion: string;
}

const BudgetFundSummarySchema: Schema = new Schema(
  {
    sourceKey: { type: String, required: true, unique: true, index: true },
    documentId: { type: String, required: true, default: "CBE-CORP-BUDGET-2023-24" },
    sourceDocument: { type: String, required: true, default: "Cbe_Corp_Budget_23-24_English.pdf" },
    sourceTitle: { type: String, required: true, default: "Coimbatore Corporation Budget 2023-2024" },
    organization: { type: String, required: true, default: "Coimbatore Corporation" },
    state: { type: String, required: true, default: "Tamil Nadu" },
    financialYear: { type: String, required: true, default: "2023-24" },
    fundName: { type: String, required: true },
    revenueReceipts: { type: Number, required: true },
    capitalReceipts: { type: Number, required: true },
    totalReceipts: { type: Number, required: true },
    revenueExpenditure: { type: Number, required: true },
    capitalExpenditure: { type: Number, required: true },
    totalExpenditure: { type: Number, required: true },
    surplusDeficit: { type: Number, required: true },
    unit: { type: String, required: true, default: "Crore INR" },
    pdfPage: { type: Number, required: true },
    documentPage: { type: Number, default: null },
    sourceReference: { type: String },
    extractionStatus: { type: String, required: true, enum: ["validated", "needs_review"], default: "validated" },
    extractedAt: { type: Date, default: Date.now },
    extractionVersion: { type: String, default: "1.0" },
  },
  { timestamps: true }
);

export const BudgetFundSummary = mongoose.model<IBudgetFundSummary>("BudgetFundSummary", BudgetFundSummarySchema);
