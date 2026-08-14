import mongoose, { Schema, Document } from "mongoose";

export interface IFundingTransaction extends Document {
  transactionId: string;
  complaintId: string;
  fundId: string;
  fundType: string;
  fundName: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  approvedBy: string;
  approvedAt: Date;
  status: "ALLOCATED" | "REVERSED" | "REJECTED";
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FundingTransactionSchema: Schema = new Schema(
  {
    transactionId: { type: String, required: true, unique: true, index: true },
    complaintId: { type: String, required: true, index: true },
    fundId: { type: String, required: true, index: true },
    fundType: { type: String, required: true, default: "BUDGET_PROJECT" },
    fundName: { type: String, required: true },
    amount: { type: Number, required: true },
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    approvedBy: { type: String, required: true },
    approvedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ["ALLOCATED", "REVERSED", "REJECTED"], default: "ALLOCATED" },
    remarks: { type: String },
  },
  { timestamps: true }
);

export const FundingTransaction = mongoose.model<IFundingTransaction>(
  "FundingTransaction",
  FundingTransactionSchema
);
