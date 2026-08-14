import { Schema, model, Document } from "mongoose";

export interface IDepartment extends Document {
  departmentId: string;
  departmentName: string;
  officerEmail: string;
}

const DepartmentSchema = new Schema<IDepartment>({
  departmentId: { type: String, required: true, unique: true },
  departmentName: { type: String, required: true, unique: true },
  officerEmail: { type: String, required: true },
});

export const Department = model<IDepartment>("Department", DepartmentSchema);

export interface IAuditLog extends Document {
  complaintId: string;
  userId?: Schema.Types.ObjectId;
  activity: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  complaintId: { type: String, required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  activity: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export const AuditLog = model<IAuditLog>("AuditLog", AuditLogSchema);

export interface INotification extends Document {
  complaintId: string;
  userId: Schema.Types.ObjectId;
  message: string;
  status: "UNREAD" | "READ";
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  complaintId: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ["UNREAD", "READ"], default: "UNREAD" },
  createdAt: { type: Date, default: Date.now },
});

export const Notification = model<INotification>("Notification", NotificationSchema);
