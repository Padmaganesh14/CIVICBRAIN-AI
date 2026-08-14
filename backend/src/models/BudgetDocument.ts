import mongoose, { Schema, Document } from "mongoose";

export interface IBudgetDocument extends Document {
  documentId: string;
  organization: string;
  financialYear: string;
  documentVersion: number;
  sourceFile: string;
  totalPages: number;
  importedAt: Date;
}

const BudgetDocumentSchema: Schema = new Schema(
  {
    documentId: { type: String, required: true, unique: true, index: true },
    organization: { type: String, required: true, default: "Coimbatore Corporation" },
    financialYear: { type: String, required: true, default: "2023-24" },
    documentVersion: { type: Number, required: true, default: 1 },
    sourceFile: { type: String, required: true, default: "Cbe_Corp_Budget_23-24_English.pdf" },
    totalPages: { type: Number, required: true, default: 115 },
    importedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const BudgetDocument = mongoose.model<IBudgetDocument>("BudgetDocument", BudgetDocumentSchema);
