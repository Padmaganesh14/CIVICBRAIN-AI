import React, { createContext, useContext, useState } from 'react';
import { calculateBudgetAllocations } from '../utils/budgetFormula';

const AppDataContext = createContext();

const initialComplaints = [
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
      "Road completely damaged along main bus route",
      "Heavy traffic route during peak hours",
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

const initialDepartments = [
  {
    name: "Roads",
    volume: 534,
    severityScore: 92,
    populationImpact: 88,
    historicalTrend: 85,
    repairCostFactor: 90,
    currentBudgetLakhs: 50,
    needEngineers: 5,
    currentEngineers: 2,
    recommendedEngineers: 3,
    satisfaction: 4.5,
    avgDays: 2.3,
    resolvedPct: 92,
    pending: 18
  },
  {
    name: "Water",
    volume: 320,
    severityScore: 78,
    populationImpact: 80,
    historicalTrend: 70,
    repairCostFactor: 75,
    currentBudgetLakhs: 35,
    needEngineers: 4,
    currentEngineers: 4,
    recommendedEngineers: 0,
    satisfaction: 4.2,
    avgDays: 1.8,
    resolvedPct: 88,
    pending: 14
  },
  {
    name: "Garbage",
    volume: 210,
    severityScore: 45,
    populationImpact: 60,
    historicalTrend: 50,
    repairCostFactor: 40,
    currentBudgetLakhs: 20,
    needEngineers: 8,
    currentEngineers: 6,
    recommendedEngineers: 2,
    satisfaction: 4.6,
    avgDays: 1.1,
    resolvedPct: 95,
    pending: 6
  },
  {
    name: "Drainage",
    volume: 280,
    severityScore: 82,
    populationImpact: 75,
    historicalTrend: 65,
    repairCostFactor: 70,
    currentBudgetLakhs: 28,
    needEngineers: 4,
    currentEngineers: 2,
    recommendedEngineers: 2,
    satisfaction: 4.1,
    avgDays: 2.6,
    resolvedPct: 84,
    pending: 22
  },
  {
    name: "Electricity",
    volume: 180,
    severityScore: 65,
    populationImpact: 70,
    historicalTrend: 55,
    repairCostFactor: 60,
    currentBudgetLakhs: 17,
    needEngineers: 3,
    currentEngineers: 3,
    recommendedEngineers: 0,
    satisfaction: 4.4,
    avgDays: 1.4,
    resolvedPct: 91,
    pending: 8
  }
];

export function AppDataProvider({ children }) {
  const [userRole, setUserRole] = useState('citizen'); // 'citizen' or 'official'
  const [activePage, setActivePage] = useState('landing');
  const [complaints, setComplaints] = useState(initialComplaints);
  const [activeTicket, setActiveTicket] = useState(initialComplaints[0]);
  const [totalPoolBudgetLakhs, setTotalPoolBudgetLakhs] = useState(200);
  const [departments, setDepartments] = useState(initialDepartments);
  const [emergencyAlert, setEmergencyAlert] = useState(false);
  const [demoStep, setDemoStep] = useState(0); // 0 to 6
  const [showCopilot, setShowCopilot] = useState(false);

  const budgetAllocations = calculateBudgetAllocations(departments, totalPoolBudgetLakhs);

  const addComplaint = (newComp) => {
    const formatted = {
      id: `CB-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      status: "Submitted",
      createdAt: new Date().toISOString(),
      ...newComp
    };
    setComplaints(prev => [formatted, ...prev]);
    setActiveTicket(formatted);
    return formatted;
  };

  const mergeDuplicate = (duplicateId) => {
    setComplaints(prev => prev.filter(c => c.id !== duplicateId));
  };

  const triggerEmergency = () => {
    setEmergencyAlert(true);
  };

  const resetDemo = () => {
    setDemoStep(0);
    setActivePage('landing');
  };

  return (
    <AppDataContext.Provider value={{
      userRole, setUserRole,
      activePage, setActivePage,
      complaints, addComplaint,
      activeTicket, setActiveTicket,
      departments, setDepartments,
      totalPoolBudgetLakhs, setTotalPoolBudgetLakhs,
      budgetAllocations,
      mergeDuplicate,
      emergencyAlert, setEmergencyAlert, triggerEmergency,
      demoStep, setDemoStep, resetDemo,
      showCopilot, setShowCopilot
    }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  return useContext(AppDataContext);
}
