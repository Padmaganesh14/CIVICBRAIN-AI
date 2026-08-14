import { Response, Request } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { WorkforceOfficer, WorkforceWorker, WorkforceAssignment } from "../models/Workforce";
import { Complaint, IComplaint } from "../models/Complaint";
import { User } from "../models/User";
import { AuditLog } from "../models/Workflow";
import { Types } from "mongoose";

// Initial Demo Seed Data required by specification
const INITIAL_DEMO_OFFICERS = [
  {
    officerId: "OFF-001",
    name: "Arun Kumar",
    department: "Water Department",
    zone: "Zone 1",
    ward: "Ward 12",
    status: "Available",
    phone: "+91 98400 11001",
    activeComplaints: 4,
    completedComplaints: 14,
    pendingComplaints: 3,
    slaRiskComplaints: 1,
    assignedWorkers: ["WRK-001"],
    isDemo: true,
  },
  {
    officerId: "OFF-002",
    name: "Priya S",
    department: "Sanitation Department",
    zone: "Zone 2",
    ward: "Ward 18",
    status: "Busy",
    phone: "+91 98400 11002",
    activeComplaints: 7,
    completedComplaints: 21,
    pendingComplaints: 5,
    slaRiskComplaints: 2,
    assignedWorkers: ["WRK-002"],
    isDemo: true,
  },
  {
    officerId: "OFF-003",
    name: "Karthik R",
    department: "Road Department",
    zone: "Zone 3",
    ward: "Ward 24",
    status: "Available",
    phone: "+91 98400 11003",
    activeComplaints: 3,
    completedComplaints: 18,
    pendingComplaints: 2,
    slaRiskComplaints: 0,
    assignedWorkers: ["WRK-003"],
    isDemo: true,
  },
  {
    officerId: "OFF-004",
    name: "Divya M",
    department: "Drainage Department",
    zone: "Zone 4",
    ward: "Ward 31",
    status: "Busy",
    phone: "+91 98400 11004",
    activeComplaints: 6,
    completedComplaints: 15,
    pendingComplaints: 4,
    slaRiskComplaints: 1,
    assignedWorkers: ["WRK-004"],
    isDemo: true,
  },
  {
    officerId: "OFF-005",
    name: "Suresh P",
    department: "Electricity Department",
    zone: "Zone 5",
    ward: "Ward 42",
    status: "Available",
    phone: "+91 98400 11005",
    activeComplaints: 2,
    completedComplaints: 25,
    pendingComplaints: 1,
    slaRiskComplaints: 0,
    assignedWorkers: ["WRK-005"],
    isDemo: true,
  },
];

const INITIAL_DEMO_WORKERS = [
  {
    workerId: "WRK-001",
    name: "Ravi",
    department: "Water Department",
    zone: "Zone 1",
    ward: "Ward 12",
    skill: "Water Pipeline Repair & Leakage Desilting",
    status: "AVAILABLE",
    currentTasks: 2,
    maxTasks: 5,
    completedTasks: 19,
    assignedOfficer: "Arun Kumar",
    equipment: ["Pressure Gauge Test Kit", "Pipe Joint Sealant Clamps", "Emergency Submersible Pump"],
    location: "T. Nagar Feeder Line 4, Zone 1",
    isDemo: true,
  },
  {
    workerId: "WRK-002",
    name: "Mani",
    department: "Sanitation Department",
    zone: "Zone 2",
    ward: "Ward 18",
    skill: "Waste Collection & Compactor Operation",
    status: "BUSY",
    currentTasks: 5,
    maxTasks: 5,
    completedTasks: 34,
    assignedOfficer: "Priya S",
    equipment: ["Hydraulic Trash Compactor Truck", "Safety Disinfectant Sprayers"],
    location: "Market Road Compactor Unit, Zone 2",
    isDemo: true,
  },
  {
    workerId: "WRK-003",
    name: "Ajay",
    department: "Road Department",
    zone: "Zone 3",
    ward: "Ward 24",
    skill: "Asphalt Road Repair & Pothole Filling",
    status: "AVAILABLE",
    currentTasks: 1,
    maxTasks: 5,
    completedTasks: 12,
    assignedOfficer: "Karthik R",
    equipment: ["Cold-Mix Bitumen Roller", "Compact Asphalt Compactor"],
    location: "Arterial Ring Road Sector 3, Zone 3",
    isDemo: true,
  },
  {
    workerId: "WRK-004",
    name: "Kumar",
    department: "Drainage Department",
    zone: "Zone 4",
    ward: "Ward 31",
    skill: "Storm Drain Maintenance & Desilting",
    status: "BUSY",
    currentTasks: 4,
    maxTasks: 5,
    completedTasks: 28,
    assignedOfficer: "Divya M",
    equipment: ["High-Pressure Silt Jetting Rig", "Drain Inspection Crawler Probe"],
    location: "Sewer Junction Box B7, Zone 4",
    isDemo: true,
  },
  {
    workerId: "WRK-005",
    name: "Bala",
    department: "Electricity Department",
    zone: "Zone 5",
    ward: "Ward 42",
    skill: "Streetlight & Transformer Fuse Maintenance",
    status: "AVAILABLE",
    currentTasks: 2,
    maxTasks: 5,
    completedTasks: 22,
    assignedOfficer: "Suresh P",
    equipment: ["High-Voltage Insulation Gloves", "Hydraulic Bucket Ladder Lift"],
    location: "Substation Line 12, Zone 5",
    isDemo: true,
  },
];

/**
 * AUTOMATIC WORKER ASSIGNMENT ENGINE
 * Deterministically assigns available worker based on department, capacity, skill & ward.
 */
export const autoAssignWorkerForComplaint = async (
  targetComplaint: string | IComplaint,
  forceOfficerId?: string
): Promise<any> => {
  try {
    let complaintDoc: any =
      typeof targetComplaint === "string"
        ? await Complaint.findOne({ complaintId: targetComplaint })
        : targetComplaint;

    if (!complaintDoc) return null;

    const dept = complaintDoc.department || complaintDoc.aiDepartment || "Water Department";
    const category = complaintDoc.aiCategory || complaintDoc.category || "General";
    const priority = complaintDoc.aiPriority || "HIGH";

    // Hard Constraint 1 & 2: Department match & Availability (MUST NOT be offline or at max capacity)
    const deptRegex = new RegExp(dept.replace("Department", "").trim(), "i");
    const candidateWorkers = await WorkforceWorker.find({
      department: deptRegex,
      status: { $ne: "OFFLINE" },
      $expr: { $lt: ["$currentTasks", "$maxTasks"] },
    });

    if (candidateWorkers.length === 0) {
      await AuditLog.create({
        complaintId: complaintDoc.complaintId,
        activity: `Automatic worker assignment queued: No available worker in ${dept} with active capacity.`,
      }).catch(() => {});
      return null;
    }

    // Deterministic Assignment Scoring
    let selectedWorker = candidateWorkers[0];
    let highestScore = -1;

    for (const w of candidateWorkers) {
      let score = 0;
      if (w.status === "AVAILABLE") score += 50;
      score += (w.maxTasks - w.currentTasks) * 10;
      if (category && w.skill.toLowerCase().includes(category.toLowerCase())) score += 30;
      if (complaintDoc.address && w.location && complaintDoc.address.toLowerCase().includes(w.location.toLowerCase())) score += 20;

      if (score > highestScore) {
        highestScore = score;
        selectedWorker = w;
      }
    }

    // Create Assignment Record
    const assignmentId = `ASN-${Date.now().toString().slice(-6)}`;
    const newAssignment = await WorkforceAssignment.create({
      assignmentId,
      complaintId: complaintDoc.complaintId,
      officerId: forceOfficerId || "OFF-001",
      workerId: selectedWorker.workerId,
      workerName: selectedWorker.name,
      department: selectedWorker.department,
      assignmentMethod: "AUTOMATIC",
      status: "ASSIGNED",
      priority: priority === "CRITICAL" ? "HIGH" : priority === "LOW" ? "LOW" : "HIGH",
      taskTitle: `${category}: ${complaintDoc.title}`,
      location: complaintDoc.address || selectedWorker.location,
      slaDeadline: "24 Hours",
      assignedAt: new Date(),
      notes: `Automatically assigned to ${selectedWorker.name} based on department capacity & skill match.`,
    });

    // Update Worker Capacity & Status
    selectedWorker.currentTasks += 1;
    selectedWorker.status = selectedWorker.currentTasks >= selectedWorker.maxTasks ? "BUSY" : "ON_TASK";
    await selectedWorker.save();

    // Update Complaint Status & History Timeline
    complaintDoc.status = "ASSIGNED";
    if (!complaintDoc.decisionHistory) complaintDoc.decisionHistory = [];
    complaintDoc.decisionHistory.push({
      timestamp: new Date(),
      action: "AUTOMATIC_WORKER_ASSIGNED",
      actor: "WORKFORCE_ENGINE",
      details: `Assigned to field worker ${selectedWorker.name} (${selectedWorker.workerId})`,
    });
    await complaintDoc.save();

    await AuditLog.create({
      complaintId: complaintDoc.complaintId,
      activity: `Field Worker ${selectedWorker.name} automatically assigned to complaint ${complaintDoc.complaintId}`,
    }).catch(() => {});

    return newAssignment;
  } catch (err: any) {
    console.error("⚠️ Error in autoAssignWorkerForComplaint:", err.message);
    return null;
  }
};

export const getWorkforceOverview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Seed initial demo officers and workers if database is empty
    const officerCount = await WorkforceOfficer.countDocuments();
    if (officerCount === 0) {
      await WorkforceOfficer.insertMany(INITIAL_DEMO_OFFICERS);
    }

    const workerCount = await WorkforceWorker.countDocuments();
    if (workerCount === 0) {
      await WorkforceWorker.insertMany(INITIAL_DEMO_WORKERS);
    }

    // Seed test complaints WATER-CBE-001, WATER-CBE-002, WATER-CBE-003 if missing
    const testComplaints = [
      {
        complaintId: "WATER-CBE-001",
        title: "Municipal Water Pipeline Breakdown",
        description: "On 9 August 2026, residents of Gandhipuram, Coimbatore reported that a municipal water pipeline had broken near their residential area. Water is continuously leaking onto the road and the regular water supply to nearby houses has been affected.",
        address: "Gandhipuram, Coimbatore",
        department: "Water Department",
        category: "Water Supply",
        aiPriority: "HIGH",
        aiCategory: "Water Supply",
        aiDepartment: "Water Department",
      },
      {
        complaintId: "WATER-CBE-002",
        title: "Broken Municipal Water Pipeline",
        description: "A municipal water pipeline has broken in Gandhipuram, Coimbatore. Water is continuously leaking from the damaged pipeline and nearby households are experiencing reduced water pressure.",
        address: "Gandhipuram, Coimbatore",
        department: "Water Department",
        category: "Water Supply",
        aiPriority: "HIGH",
        aiCategory: "Water Supply",
        aiDepartment: "Water Department",
      },
      {
        complaintId: "WATER-CBE-003",
        title: "Water Pipeline Leakage",
        description: "Water pipeline leakage near Gandhipuram bus stand affecting road traffic and drinking water supply.",
        address: "Gandhipuram, Coimbatore",
        department: "Water Department",
        category: "Water Supply",
        aiPriority: "MEDIUM",
        aiCategory: "Water Supply",
        aiDepartment: "Water Department",
      },
    ];

    const dummyUser = await User.findOne({ role: "citizen" });
    for (const tc of testComplaints) {
      const exists = await Complaint.findOne({ complaintId: tc.complaintId });
      if (!exists) {
        await Complaint.create({
          ...tc,
          userId: dummyUser?._id || new Types.ObjectId(),
          contactNumber: "+91 98400 12345",
          status: "AI_PROCESSED",
        });
      }
    }

    // Auto-assign any unassigned active complaints in MongoDB
    const activeComplaints = await Complaint.find().sort({ createdAt: -1 });
    for (const comp of activeComplaints) {
      const existingAsn = await WorkforceAssignment.findOne({ complaintId: comp.complaintId });
      if (!existingAsn) {
        await autoAssignWorkerForComplaint(comp);
      }
    }

    const officers = await WorkforceOfficer.find().sort({ officerId: 1 });
    const workers = await WorkforceWorker.find().sort({ workerId: 1 });
    const rawAssignments = await WorkforceAssignment.find().sort({ createdAt: -1 });

    // Enrich assignments with real MongoDB Complaint details
    const assignments = await Promise.all(
      rawAssignments.map(async (asn) => {
        const comp = await Complaint.findOne({ complaintId: asn.complaintId });
        const plainAsn = asn.toObject();
        if (comp) {
          return {
            ...plainAsn,
            taskTitle: comp.title || plainAsn.taskTitle,
            description: comp.description || "",
            location: comp.address || plainAsn.location,
            category: comp.aiCategory || comp.category || "General",
            priority: comp.aiPriority || plainAsn.priority || "HIGH",
            assignmentMethod: plainAsn.assignmentMethod || "AUTOMATIC",
          };
        }
        return plainAsn;
      })
    );

    // Full MongoDB Complaint History for View Complaints Modal & Audit History
    const allComplaints = await Complaint.find().sort({ updatedAt: -1 });
    const complaintHistory = await Promise.all(
      allComplaints.map(async (comp) => {
        const asn = await WorkforceAssignment.findOne({ complaintId: comp.complaintId });
        const plainComp = comp.toObject();
        return {
          ...plainComp,
          assignedWorkerName: asn ? asn.workerName : "Unassigned",
          assignedWorkerId: asn ? asn.workerId : null,
          assignmentMethod: asn ? asn.assignmentMethod || "AUTOMATIC" : "UNASSIGNED",
          assignmentStatus: asn ? asn.status : "UNASSIGNED",
          assignedAt: asn ? asn.assignedAt : null,
          slaStatus: comp.aiPriority === "HIGH" || comp.aiPriority === "CRITICAL" ? "AT RISK" : "ON TRACK",
          budgetStatus: comp.fundingDecision?.status || "NOT_REQUESTED",
          approvedBudgetAmount: comp.fundingDecision?.amountAllocated || 0,
        };
      })
    );

    const admin = {
      adminId: "ADMIN-001",
      name: "Municipal Administrator",
      role: "ADMIN",
      status: "Active",
      phone: "+91 98400 00001",
      department: "Coimbatore Corporation HQ",
    };

    const departmentWorkload = [
      {
        department: "Water Department",
        officers: officers.filter((o) => o.department === "Water Department").length || 4,
        workers: workers.filter((w) => w.department === "Water Department").length || 12,
        activeTasks: assignments.filter((a) => a.department === "Water Department" && a.status !== "COMPLETED").length || 2,
      },
      {
        department: "Sanitation Department",
        officers: officers.filter((o) => o.department === "Sanitation Department").length || 3,
        workers: workers.filter((w) => w.department === "Sanitation Department").length || 15,
        activeTasks: assignments.filter((a) => a.department === "Sanitation Department" && a.status !== "COMPLETED").length || 1,
      },
      {
        department: "Road Department",
        officers: officers.filter((o) => o.department === "Road Department").length || 3,
        workers: workers.filter((w) => w.department === "Road Department").length || 10,
        activeTasks: assignments.filter((a) => a.department === "Road Department" && a.status !== "COMPLETED").length || 1,
      },
      {
        department: "Drainage Department",
        officers: officers.filter((o) => o.department === "Drainage Department").length || 3,
        workers: workers.filter((w) => w.department === "Drainage Department").length || 11,
        activeTasks: assignments.filter((a) => a.department === "Drainage Department" && a.status !== "COMPLETED").length || 1,
      },
      {
        department: "Electricity Department",
        officers: officers.filter((o) => o.department === "Electricity Department").length || 2,
        workers: workers.filter((w) => w.department === "Electricity Department").length || 8,
        activeTasks: assignments.filter((a) => a.department === "Electricity Department" && a.status !== "COMPLETED").length || 1,
      },
    ];

    res.status(200).json({
      success: true,
      data: {
        admin,
        officers,
        workers,
        assignments,
        complaintHistory,
        departmentWorkload,
        metrics: {
          totalOfficers: officers.length,
          availableOfficers: officers.filter((o) => o.status === "Available").length,
          busyOfficers: officers.filter((o) => o.status === "Busy").length,
          totalWorkers: workers.length,
          availableWorkers: workers.filter((w) => w.status === "AVAILABLE").length,
          busyWorkers: workers.filter((w) => w.status === "BUSY" || w.status === "ON_TASK").length,
          totalAssignments: assignments.length,
          activeAssignments: assignments.filter((a) => a.status !== "COMPLETED").length,
          completedAssignments: assignments.filter((a) => a.status === "COMPLETED").length,
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * OFFICER MANUAL TASK ASSIGNMENT / REASSIGNMENT OVERRIDE
 */
export const assignTaskToWorker = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { complaintId, workerId, officerId, taskTitle, location, priority } = req.body;

    const worker = await WorkforceWorker.findOne({ workerId });
    if (!worker) {
      res.status(404).json({ success: false, message: "Field worker not found." });
      return;
    }

    // Hard Constraint Validation 1: Worker Status (MUST NOT be offline)
    if (worker.status === "OFFLINE") {
      res.status(400).json({ success: false, message: `Field worker ${worker.name} is currently offline and cannot be assigned.` });
      return;
    }

    // Hard Constraint Validation 2: Worker Capacity
    if (worker.currentTasks >= worker.maxTasks) {
      res.status(400).json({ success: false, message: `Worker ${worker.name} has reached maximum task capacity (${worker.maxTasks}/${worker.maxTasks}).` });
      return;
    }

    const targetComplaintId = complaintId || `TN-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const complaint = await Complaint.findOne({ complaintId: targetComplaintId });

    // Hard Constraint Validation 3: Department Compatibility
    if (complaint && complaint.department) {
      const compDeptKey = complaint.department.replace("Department", "").trim().toLowerCase();
      const workerDeptKey = worker.department.replace("Department", "").trim().toLowerCase();
      if (!workerDeptKey.includes(compDeptKey) && !compDeptKey.includes(workerDeptKey)) {
        res.status(400).json({
          success: false,
          message: `Department mismatch: ${complaint.department} complaint cannot be assigned to ${worker.department} worker ${worker.name}.`,
        });
        return;
      }
    }

    // Single Source of Truth & Reassignment Rule: ONE active assignment per complaint
    const existingAssignment = await WorkforceAssignment.findOne({ complaintId: targetComplaintId });

    if (existingAssignment) {
      // Reassignment: Decrement previous worker's task count
      if (existingAssignment.workerId !== worker.workerId) {
        const prevWorker = await WorkforceWorker.findOne({ workerId: existingAssignment.workerId });
        if (prevWorker) {
          prevWorker.currentTasks = Math.max(0, prevWorker.currentTasks - 1);
          if (prevWorker.currentTasks === 0) prevWorker.status = "AVAILABLE";
          await prevWorker.save();
        }
      }

      existingAssignment.workerId = worker.workerId;
      existingAssignment.workerName = worker.name;
      existingAssignment.department = worker.department;
      existingAssignment.assignmentMethod = "MANUAL";
      existingAssignment.status = "ASSIGNED";
      existingAssignment.taskTitle = taskTitle || existingAssignment.taskTitle || (complaint ? complaint.title : "Grievance Repair Task");
      existingAssignment.location = location || existingAssignment.location || (complaint ? complaint.address : worker.location);
      existingAssignment.priority = priority || existingAssignment.priority || "HIGH";
      existingAssignment.notes = `Manually reassigned to ${worker.name} by officer override.`;
      existingAssignment.assignedAt = new Date();
      await existingAssignment.save();

      worker.currentTasks += 1;
      worker.status = worker.currentTasks >= worker.maxTasks ? "BUSY" : "ON_TASK";
      await worker.save();

      if (complaint) {
        complaint.status = "ASSIGNED";
        if (!complaint.decisionHistory) complaint.decisionHistory = [];
        complaint.decisionHistory.push({
          timestamp: new Date(),
          action: "OFFICER_MANUAL_REASSIGNMENT",
          actor: req.user?.username || "OFFICER",
          details: `Manually reassigned to field worker ${worker.name} (${worker.workerId})`,
        });
        await complaint.save();
      }

      await AuditLog.create({
        complaintId: targetComplaintId,
        activity: `Officer manually reassigned complaint ${targetComplaintId} to field worker ${worker.name}`,
      }).catch(() => {});

      res.status(200).json({
        success: true,
        message: `Task manually reassigned to worker ${worker.name}.`,
        data: existingAssignment,
      });
      return;
    }

    // New Manual Assignment
    const assignmentId = `ASN-${Date.now().toString().slice(-6)}`;
    const newAssignment = await WorkforceAssignment.create({
      assignmentId,
      complaintId: targetComplaintId,
      officerId: officerId || "OFF-001",
      workerId: worker.workerId,
      workerName: worker.name,
      department: worker.department,
      assignmentMethod: "MANUAL",
      status: "ASSIGNED",
      priority: priority || "HIGH",
      taskTitle: taskTitle || (complaint ? complaint.title : `Grievance Repair Task for ${worker.department}`),
      location: location || (complaint ? complaint.address : worker.location),
      slaDeadline: "24 Hours",
      assignedAt: new Date(),
      notes: "Task manually assigned by officer override.",
    });

    worker.currentTasks += 1;
    worker.status = worker.currentTasks >= worker.maxTasks ? "BUSY" : "ON_TASK";
    await worker.save();

    if (complaint) {
      complaint.status = "ASSIGNED";
      if (!complaint.decisionHistory) complaint.decisionHistory = [];
      complaint.decisionHistory.push({
        timestamp: new Date(),
        action: "OFFICER_MANUAL_ASSIGNMENT",
        actor: req.user?.username || "OFFICER",
        details: `Manually assigned to field worker ${worker.name} (${worker.workerId})`,
      });
      await complaint.save();
    }

    await AuditLog.create({
      complaintId: targetComplaintId,
      activity: `Officer manually assigned complaint ${targetComplaintId} to field worker ${worker.name}`,
    }).catch(() => {});

    res.status(201).json({
      success: true,
      message: `Task manually assigned to worker ${worker.name}.`,
      data: newAssignment,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateWorkerTaskStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { assignmentId, status, notes, beforeAfterImage } = req.body;

    const assignment = await WorkforceAssignment.findOne({ assignmentId });
    if (!assignment) {
      res.status(404).json({ success: false, message: "Assignment record not found." });
      return;
    }

    assignment.status = status;
    if (notes) assignment.notes = notes;
    if (beforeAfterImage) assignment.beforeAfterImage = beforeAfterImage;

    const complaint = await Complaint.findOne({ complaintId: assignment.complaintId });
    const actorName = assignment.workerName || "FIELD_WORKER";

    if (["WORK_STARTED", "IN_PROGRESS"].includes(status)) {
      if (complaint) {
        complaint.status = "IN_PROGRESS";
        if (!complaint.decisionHistory) complaint.decisionHistory = [];
        complaint.decisionHistory.push({
          timestamp: new Date(),
          action: `WORKER_STATUS_${status}`,
          actor: actorName,
          details: notes || `Field worker updated status to ${status}`,
        });
        await complaint.save();
      }
    }

    if (status === "COMPLETED") {
      assignment.completedAt = new Date();

      // Free up worker capacity
      const worker = await WorkforceWorker.findOne({ workerId: assignment.workerId });
      if (worker) {
        worker.currentTasks = Math.max(0, worker.currentTasks - 1);
        worker.completedTasks += 1;
        if (worker.currentTasks === 0) worker.status = "AVAILABLE";
        await worker.save();
      }

      // Update Single Source of Truth Complaint Record
      if (complaint) {
        complaint.status = "RESOLVED";
        complaint.closedAt = new Date();
        if (!complaint.decisionHistory) complaint.decisionHistory = [];
        if (!complaint.resolutionProof) complaint.resolutionProof = [];
        complaint.decisionHistory.push({
          timestamp: new Date(),
          action: "WORKER_COMPLETED_TASK",
          actor: actorName,
          details: notes || `Resolution proof submitted by worker ${actorName}`,
        });
        if (beforeAfterImage) {
          complaint.resolutionProof.push({
            filename: `proof_${Date.now()}.png`,
            originalName: "field_resolution_proof.png",
            mimeType: "image/png",
            size: 1024,
            url: beforeAfterImage,
          });
        }
        await complaint.save();
      }
    }

    await assignment.save();

    await AuditLog.create({
      complaintId: assignment.complaintId,
      activity: `Field Worker ${actorName} updated assignment ${assignment.assignmentId} status to ${status}`,
    }).catch(() => {});

    res.status(200).json({
      success: true,
      message: `Task status updated to ${status}.`,
      data: assignment,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addWorkforceOfficer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, department, zone, ward, phone } = req.body;
    const officerId = `OFF-00${Math.floor(6 + Math.random() * 90)}`;

    const newOfficer = await WorkforceOfficer.create({
      officerId,
      name: name || "New Demo Officer",
      department: department || "Water Department",
      zone: zone || "Zone 1",
      ward: ward || "Ward 10",
      phone: phone || "+91 98400 99999",
      status: "Available",
      activeComplaints: 0,
      completedComplaints: 0,
      pendingComplaints: 0,
      slaRiskComplaints: 0,
      assignedWorkers: [],
      isDemo: true,
    });

    res.status(201).json({ success: true, data: newOfficer });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addWorkforceWorker = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, department, zone, ward, skill, assignedOfficer, equipment } = req.body;
    const workerId = `WRK-00${Math.floor(6 + Math.random() * 90)}`;

    const newWorker = await WorkforceWorker.create({
      workerId,
      name: name || "New Demo Worker",
      department: department || "Sanitation Department",
      zone: zone || "Zone 1",
      ward: ward || "Ward 10",
      skill: skill || "General Maintenance",
      status: "AVAILABLE",
      currentTasks: 0,
      maxTasks: 5,
      completedTasks: 0,
      assignedOfficer: assignedOfficer || "Arun Kumar",
      equipment: equipment || ["Standard Tool Kit"],
      location: `${zone || "Zone 1"}, ${ward || "Ward 10"}`,
      isDemo: true,
    });

    res.status(201).json({ success: true, data: newWorker });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateWorkforceWorkerStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { workerId, status } = req.body;
    const worker = await WorkforceWorker.findOne({ workerId });
    if (!worker) {
      res.status(404).json({ success: false, message: "Worker not found." });
      return;
    }
    worker.status = status;
    await worker.save();

    res.status(200).json({ success: true, data: worker });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * CITIZEN & OFFICER TRACKING ENDPOINT (Single Source of Truth)
 * Resolves actual Complaint status, workforce assignment, evidence, and audit timeline from MongoDB.
 */
export const getCitizenTrackingInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { complaintId } = req.params;
    const targetId =
      complaintId ||
      (req.query.query as string) ||
      (req.query.trackingNumber as string) ||
      (req.query.complaintId as string) ||
      (req.query.mobileNumber as string) ||
      (req.query.mobile as string);

    if (!targetId) {
      res.status(400).json({ success: false, message: "A complaint ID, tracking number, or mobile number is required for tracking." });
      return;
    }

    const rawStr = (Array.isArray(targetId) ? targetId[0] : String(targetId)).trim();
    // Safely escape regex special characters to prevent regex injection
    const escapedStr = rawStr.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    // Normalize mobile phone numbers (remove +91 prefix and non-digits)
    const cleanPhone = rawStr.replace(/^\+91/, "").replace(/\D/g, "");

    const searchConditions: any[] = [
      { complaintId: rawStr },
      { complaintId: { $regex: `^${escapedStr}$`, $options: "i" } },
      { complaintId: { $regex: escapedStr, $options: "i" } },
      { contactNumber: rawStr },
    ];

    if (cleanPhone && cleanPhone.length >= 7) {
      searchConditions.push({ contactNumber: cleanPhone });
      searchConditions.push({ contactNumber: { $regex: cleanPhone, $options: "i" } });
    }

    if (Types.ObjectId.isValid(rawStr)) {
      searchConditions.push({ _id: rawStr });
    }

    const complaint = await Complaint.findOne({
      $or: searchConditions,
    }).populate("userId", "name username phone")
      .populate("assignedOfficer", "name username department");

    if (!complaint) {
      res.status(404).json({ success: false, message: `No grievance record found for tracking search: "${rawStr}"` });
      return;
    }

    const assignment = await WorkforceAssignment.findOne({ complaintId: complaint.complaintId });
    const auditLogs = await AuditLog.find({ complaintId: complaint.complaintId }).sort({ timestamp: 1 });

    const assignedOfficerName = (complaint.assignedOfficer as any)?.name || (complaint.assignedOfficer as any)?.username || "Assigned Municipal Officer";

    res.status(200).json({
      success: true,
      data: {
        id: complaint.complaintId,
        complaintId: complaint.complaintId,
        trackingNumber: complaint.complaintId,
        title: complaint.title,
        description: complaint.description,
        category: complaint.aiCategory || complaint.category || "General",
        department: complaint.department || complaint.aiDepartment || "Municipal Corporation",
        status: complaint.status,
        priority: (complaint.aiPriority || "MEDIUM").toLowerCase(),
        severity: complaint.aiSeverity ?? 50,
        address: complaint.address,
        landmark: complaint.landmark,
        contactNumber: complaint.contactNumber,
        officer: assignedOfficerName,
        createdAt: complaint.createdAt,
        closedAt: complaint.closedAt,
        assignment: assignment
          ? {
              assignmentId: assignment.assignmentId,
              workerId: assignment.workerId,
              workerName: assignment.workerName,
              status: assignment.status,
              taskTitle: assignment.taskTitle,
              assignedAt: assignment.assignedAt,
              completedAt: assignment.completedAt,
              notes: assignment.notes,
              beforeAfterImage: assignment.beforeAfterImage,
              assignmentMethod: assignment.assignmentMethod || "AUTOMATIC",
            }
          : null,
        resolutionProof: complaint.resolutionProof || [],
        timeline: auditLogs.map((log) => ({
          timestamp: log.timestamp,
          activity: log.activity,
        })),
        decisionHistory: complaint.decisionHistory || [],
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
