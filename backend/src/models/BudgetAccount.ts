import mongoose, { Schema, Document } from "mongoose";

export interface IBudgetAccount extends Document {
  sourceKey: string;
  documentId: string;
  sourceDocument: string;
  sourceTitle: string;
  organization: string;
  state: string;
  financialYear: string;
  accountCode: string;
  majorCode?: string;
  description?: string;
  fundName?: string;
  actualPreviousYear?: number | null;
  budgetPreviousYear?: number | null;
  revisedEstimate?: number | null;
  budgetEstimate?: number | null;
  unit: string;
  pdfPage: number;
  documentPage?: number | null;
  sourceReference?: string;
  extractionStatus: "validated" | "needs_review";
  extractedAt: Date;
}

const BudgetAccountSchema: Schema = new Schema(
  {
    sourceKey: { type: String, required: true, unique: true, index: true },
    documentId: { type: String, required: true, default: "CBE-CORP-BUDGET-2023-24" },
    sourceDocument: { type: String, required: true, default: "Cbe_Corp_Budget_23-24_English.pdf" },
    sourceTitle: { type: String, required: true, default: "Coimbatore Corporation Budget 2023-2024" },
    organization: { type: String, required: true, default: "Coimbatore Corporation" },
    state: { type: String, required: true, default: "Tamil Nadu" },
    financialYear: { type: String, required: true, default: "2023-24" },
    accountCode: { type: String, required: true },
    majorCode: { type: String },
    description: { type: String },
    fundName: { type: String },
    actualPreviousYear: { type: Number, default: null },
    budgetPreviousYear: { type: Number, default: null },
    revisedEstimate: { type: Number, default: null },
    budgetEstimate: { type: Number, default: null },
    unit: { type: String, required: true, default: "Crore INR" },
    pdfPage: { type: Number, required: true },
    documentPage: { type: Number, default: null },
    sourceReference: { type: String },
    extractionStatus: { type: String, required: true, enum: ["validated", "needs_review"], default: "validated" },
    extractedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const BudgetAccount = mongoose.model<IBudgetAccount>("BudgetAccount", BudgetAccountSchema);
