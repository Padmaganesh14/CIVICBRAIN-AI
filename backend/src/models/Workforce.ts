import { Schema, model, Document } from "mongoose";

export interface IWorkforceOfficer extends Document {
  officerId: string;
  name: string;
  department: string;
  zone: string;
  ward: string;
  status: "Available" | "Busy" | "Offline";
  phone: string;
  activeComplaints: number;
  completedComplaints: number;
  pendingComplaints: number;
  slaRiskComplaints: number;
  assignedWorkers: string[];
  isDemo: boolean;
}

export interface IWorkforceWorker extends Document {
  workerId: string;
  name: string;
  department: string;
  zone: string;
  ward: string;
  skill: string;
  status: "AVAILABLE" | "BUSY" | "OFFLINE" | "ON_TASK";
  currentTasks: number;
  maxTasks: number;
  completedTasks: number;
  assignedOfficer: string;
  equipment: string[];
  location: string;
  isDemo: boolean;
}

export interface IWorkforceAssignment extends Document {
  assignmentId: string;
  complaintId: string;
  officerId: string;
  workerId: string;
  workerName: string;
  department: string;
  assignmentMethod: "AUTOMATIC" | "MANUAL";
  status: "ASSIGNED" | "WORK_STARTED" | "IN_PROGRESS" | "COMPLETED";
  priority: "HIGH" | "MEDIUM" | "LOW";
  taskTitle: string;
  location: string;
  slaDeadline: string;
  assignedAt: Date;
  completedAt?: Date;
  notes?: string;
  beforeAfterImage?: string;
}

const WorkforceOfficerSchema = new Schema<IWorkforceOfficer>({
  officerId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  department: { type: String, required: true },
  zone: { type: String, required: true },
  ward: { type: String, required: true },
  status: { type: String, enum: ["Available", "Busy", "Offline"], default: "Available" },
  phone: { type: String, default: "+91 98400 12345" },
  activeComplaints: { type: Number, default: 4 },
  completedComplaints: { type: Number, default: 12 },
  pendingComplaints: { type: Number, default: 3 },
  slaRiskComplaints: { type: Number, default: 1 },
  assignedWorkers: [{ type: String }],
  isDemo: { type: Boolean, default: true },
});

const WorkforceWorkerSchema = new Schema<IWorkforceWorker>({
  workerId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  department: { type: String, required: true },
  zone: { type: String, required: true },
  ward: { type: String, required: true },
  skill: { type: String, required: true },
  status: { type: String, enum: ["AVAILABLE", "BUSY", "OFFLINE", "ON_TASK"], default: "AVAILABLE" },
  currentTasks: { type: Number, default: 2 },
  maxTasks: { type: Number, default: 5 },
  completedTasks: { type: Number, default: 18 },
  assignedOfficer: { type: String, default: "Arun Kumar" },
  equipment: [{ type: String }],
  location: { type: String, default: "Zone 1, Ward 12" },
  isDemo: { type: Boolean, default: true },
});

const WorkforceAssignmentSchema = new Schema<IWorkforceAssignment>(
  {
    assignmentId: { type: String, required: true, unique: true, index: true },
    complaintId: { type: String, required: true },
    officerId: { type: String, required: true },
    workerId: { type: String, required: true },
    workerName: { type: String, required: true },
    department: { type: String, required: true },
    assignmentMethod: { type: String, enum: ["AUTOMATIC", "MANUAL"], default: "AUTOMATIC" },
    status: { type: String, enum: ["ASSIGNED", "WORK_STARTED", "IN_PROGRESS", "COMPLETED"], default: "ASSIGNED" },
    priority: { type: String, enum: ["HIGH", "MEDIUM", "LOW"], default: "HIGH" },
    taskTitle: { type: String, required: true },
    location: { type: String, required: true },
    slaDeadline: { type: String, default: "24 Hours" },
    assignedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    notes: { type: String },
    beforeAfterImage: { type: String },
  },
  { timestamps: true }
);

export const WorkforceOfficer = model<IWorkforceOfficer>("WorkforceOfficer", WorkforceOfficerSchema);
export const WorkforceWorker = model<IWorkforceWorker>("WorkforceWorker", WorkforceWorkerSchema);
export const WorkforceAssignment = model<IWorkforceAssignment>("WorkforceAssignment", WorkforceAssignmentSchema);
