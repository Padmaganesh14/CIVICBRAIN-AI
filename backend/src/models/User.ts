import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email?: string;
  passwordHash: string;
  name: string;
  phone?: string;
  role: "citizen" | "officer";
  department?: string;
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String },
    role: { type: String, enum: ["citizen", "officer"], required: true, default: "citizen" },
    department: { type: String, default: null },
    tokenVersion: { type: Number, default: 1, required: true },
  },
  { timestamps: true }
);

export const User = model<IUser>("User", UserSchema);
