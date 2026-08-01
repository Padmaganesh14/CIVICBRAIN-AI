// Initial rich municipal complaints dataset
let complaints = [
  {
    id: "CB-2026-00123",
    title: "Large Potholes near Model School",
    description: "Dangerous deep road damage on Anna Salai Road near Model School entrance causing severe traffic jams and accident risks for children.",
    department: "Roads",
    departmentConfidence: 98,
    priority: "Critical",
    priorityConfidence: 94,
    status: "In Progress",
    assignedWard: "18",
    location: "Anna Salai Main Road, Ward 18",
    estimatedBudget: "₹4.8 Lakhs",
    estimatedBudgetValue: 480000,
    estimatedResolution: "2 Days",
    duplicateScore: 91,
    possibleDuplicate: "CB-2026-00098: Road Damage Anna Salai",
    createdAt: "2026-08-01T09:30:00Z",
    explanationReasons: [
      "42 complaints reported in this 200m radius",
      "School located within 150 meters",
      "Road completely damaged along main transit route",
      "Heavy peak hour traffic route",
      "Estimated 5,000+ citizens affected daily"
    ]
  },
  {
    id: "CB-2026-00122",
    title: "Water Pipeline Leakage near City Hospital",
    description: "High pressure main water pipe leakage flooding street corner and reducing drinking water supply pressure.",
    department: "Water",
    departmentConfidence: 96,
    priority: "Critical",
    priorityConfidence: 92,
    status: "Officer Assigned",
    assignedWard: "7",
    location: "Hospital Road, Ward 7",
    estimatedBudget: "₹3.2 Lakhs",
    estimatedBudgetValue: 320000,
    estimatedResolution: "1 Day",
    duplicateScore: 78,
    possibleDuplicate: "CB-2026-00085: Water leak Ward 7",
    createdAt: "2026-08-01T08:15:00Z",
    explanationReasons: [
      "Hospital zone within 50 meters",
      "Critical clean water supply line compromised",
      "Street flooding causing access difficulty"
    ]
  },
  {
    id: "CB-2026-00121",
    title: "Garbage Pileup behind Commercial Complex",
    description: "Uncollected waste accumulated for 4 days creating foul odor and health concerns.",
    department: "Garbage",
    departmentConfidence: 99,
    priority: "Medium",
    priorityConfidence: 89,
    status: "Submitted",
    assignedWard: "12",
    location: "Market Road, Ward 12",
    estimatedBudget: "₹0.6 Lakhs",
    estimatedBudgetValue: 60000,
    estimatedResolution: "1 Day",
    duplicateScore: 45,
    createdAt: "2026-08-01T07:45:00Z",
    explanationReasons: [
      "Public sanitation hazard in commercial area",
      "Regular clearance route missed",
      "Low structural damage, high nuisance score"
    ]
  },
  {
    id: "CB-2026-00120",
    title: "Open Drainage Overflow on 5th Cross Street",
    description: "Drainage water overflowing onto walking path near residential complex.",
    department: "Drainage",
    departmentConfidence: 97,
    priority: "High",
    priorityConfidence: 91,
    status: "AI Classified",
    assignedWard: "7",
    location: "5th Cross Street, Ward 7",
    estimatedBudget: "₹1.8 Lakhs",
    estimatedBudgetValue: 180000,
    estimatedResolution: "2 Days",
    duplicateScore: 88,
    possibleDuplicate: "CB-2026-00104: Drainage blockage Ward 7",
    createdAt: "2026-07-31T18:20:00Z",
    explanationReasons: [
      "Multiple overflow incidents in Ward 7 drainage bottleneck",
      "Health hazard to local residents",
      "Requires mechanical de-silting crew"
    ]
  },
  {
    id: "CB-2026-00119",
    title: "Faulty Streetlight Pole & Hanging Wires",
    description: "Streetlights dark for 3 consecutive nights; loose wire hanging near bus stop.",
    department: "Electricity",
    departmentConfidence: 95,
    priority: "High",
    priorityConfidence: 93,
    status: "Work Started",
    assignedWard: "4",
    location: "Bus Stop Avenue, Ward 4",
    estimatedBudget: "₹0.9 Lakhs",
    estimatedBudgetValue: 90000,
    estimatedResolution: "1 Day",
    duplicateScore: 30,
    createdAt: "2026-07-31T14:10:00Z",
    explanationReasons: [
      "Exposed electrical wiring hazard",
      "Nighttime pedestrian safety concern at bus stop",
      "Requires rapid line repair deployment"
    ]
  }
];

export const getComplaints = (req, res) => {
  res.json({ success: true, count: complaints.length, data: complaints });
};

export const createComplaint = (req, res) => {
  const newComplaint = {
    id: `CB-2026-${Math.floor(10000 + Math.random() * 90000)}`,
    ...req.body,
    createdAt: new Date().toISOString(),
    status: "Submitted"
  };
  complaints.unshift(newComplaint);
  res.status(201).json({ success: true, data: newComplaint });
};

export const mergeDuplicate = (req, res) => {
  const { primaryId, duplicateId } = req.body;
  complaints = complaints.filter(c => c.id !== duplicateId);
  res.json({ success: true, message: `Merged complaint ${duplicateId} into ${primaryId}` });
};

export const updateStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const complaint = complaints.find(c => c.id === id);
  if (complaint) {
    complaint.status = status;
    return res.json({ success: true, data: complaint });
  }
  res.status(404).json({ success: false, message: "Complaint not found" });
};
