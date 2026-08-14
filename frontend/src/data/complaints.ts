export type StageKey =
  | "step.submitted"
  | "step.ai"
  | "step.assigned"
  | "step.review"
  | "step.progress"
  | "step.resolved";

export const stageOrder: StageKey[] = [
  "step.submitted",
  "step.ai",
  "step.assigned",
  "step.review",
  "step.progress",
  "step.resolved",
];

export type Priority = "critical" | "high" | "medium" | "low";

export type Complaint = {
  id: string;
  tracking: string;
  mobile: string;
  citizen: string;
  citizenEmail: string;
  district: string;
  address: string;
  departmentId: string;
  category: string;
  title: string;
  description: string;
  filedOn: string;
  eta: string;
  stage: StageKey;
  priority: Priority;
  severity: number;
  confidence: number;
  sentiment: string;
  risk: string;
  officer: string;
  duplicates: number;
  aiSummary: string;
  suggestedResponse: string;
  evidence: { name: string; type: "image" | "video" | "pdf" | "audio"; size: string }[];
  timeline: { stage: StageKey; at: string; note: string }[];
};

export const complaints: Complaint[] = [
  {
    id: "TN-GRV-2026-004812",
    tracking: "TRK-88213045",
    mobile: "9840012345",
    citizen: "Meena Ravichandran",
    citizenEmail: "meena.r@example.in",
    district: "Coimbatore",
    address: "12/4, Sundarapuram 3rd Street, near RS Puram signal",
    departmentId: "electricity",
    category: "Street light",
    title: "Street lights not working for six nights on Sundarapuram 3rd Street",
    description:
      "The entire stretch of Sundarapuram 3rd Street has been dark for six nights. Two elderly residents have already tripped near the open drain. Requesting urgent restoration of the street lighting.",
    filedOn: "12 Jul 2026, 21:14",
    eta: "16 Jul 2026, 18:00",
    stage: "step.progress",
    priority: "high",
    severity: 78,
    confidence: 96,
    sentiment: "Concerned / urgent",
    risk: "Public safety risk after dark",
    officer: "Thiru. K. Anbarasan, AE (Electricity, Zone 4)",
    duplicates: 3,
    aiSummary:
      "Extended street-light outage affecting a residential stretch of ~400 m for six consecutive nights, with two reported fall injuries near an open drain. Classified as an electrical distribution fault with an elevated public-safety component. Three similar reports from the same street cluster suggest a feeder-level failure rather than individual lamp failures.",
    suggestedResponse:
      "Thank you for reporting. A feeder inspection has been scheduled for Sundarapuram 3rd Street. Our assistant engineer will restore lighting within 48 hours and the open drain has been flagged to the Municipal Corporation for immediate covering.",
    evidence: [
      { name: "dark-street-night.jpg", type: "image", size: "2.4 MB" },
      { name: "open-drain.jpg", type: "image", size: "1.9 MB" },
      { name: "voice-note-tamil.m4a", type: "audio", size: "480 KB" },
    ],
    timeline: [
      { stage: "step.submitted", at: "12 Jul, 21:14", note: "Filed by citizen with 3 attachments" },
      { stage: "step.ai", at: "12 Jul, 21:14", note: "Analysed in 1.8s · confidence 96%" },
      { stage: "step.assigned", at: "12 Jul, 21:16", note: "Routed to Electricity, Zone 4" },
      { stage: "step.review", at: "13 Jul, 09:02", note: "Accepted by AE K. Anbarasan" },
      { stage: "step.progress", at: "13 Jul, 15:40", note: "Feeder inspection scheduled" },
    ],
  },
  {
    id: "TN-GRV-2026-004977",
    tracking: "TRK-88219902",
    mobile: "9791045566",
    citizen: "Arun Kumar S.",
    citizenEmail: "arun.s@example.in",
    district: "Madurai",
    address: "Anna Nagar 7th Cross, opposite the water tank",
    departmentId: "water",
    category: "Pipeline leak",
    title: "Continuous drinking water leak from the main pipeline",
    description:
      "A main pipeline near the water tank has been leaking continuously for four days. Thousands of litres are wasted daily and the road is flooded.",
    filedOn: "18 Jul 2026, 08:05",
    eta: "20 Jul 2026, 12:00",
    stage: "step.review",
    priority: "critical",
    severity: 91,
    confidence: 98,
    sentiment: "Frustrated",
    risk: "Water wastage and road damage",
    officer: "Tmt. R. Kalaivani, JE (Water Supply)",
    duplicates: 1,
    aiSummary:
      "Continuous high-volume leak from a distribution main adjacent to an overhead tank, ongoing for four days with visible road flooding. High wastage and secondary road-damage risk. Escalated to critical due to volume and duration.",
    suggestedResponse:
      "A valve isolation crew has been dispatched to Anna Nagar 7th Cross. Supply may be interrupted for four hours during the repair. We will update you once the main is sealed.",
    evidence: [
      { name: "leak-video.mp4", type: "video", size: "18.2 MB" },
      { name: "flooded-road.jpg", type: "image", size: "3.1 MB" },
    ],
    timeline: [
      { stage: "step.submitted", at: "18 Jul, 08:05", note: "Filed by citizen with 2 attachments" },
      { stage: "step.ai", at: "18 Jul, 08:05", note: "Analysed in 2.1s · confidence 98%" },
      { stage: "step.assigned", at: "18 Jul, 08:07", note: "Routed to Water Supply, Madurai South" },
      { stage: "step.review", at: "18 Jul, 09:30", note: "Under officer review" },
    ],
  },
  {
    id: "TN-GRV-2026-004503",
    tracking: "TRK-88201188",
    mobile: "9840012345",
    citizen: "Meena Ravichandran",
    citizenEmail: "meena.r@example.in",
    district: "Coimbatore",
    address: "Race Course Road, near the flyover ramp",
    departmentId: "roads",
    category: "Pothole",
    title: "Deep potholes on Race Course Road causing two-wheeler skids",
    description:
      "Three deep potholes formed after the last rain. Two-wheelers skid every evening, especially in low light.",
    filedOn: "28 Jun 2026, 17:40",
    eta: "05 Jul 2026, 18:00",
    stage: "step.resolved",
    priority: "medium",
    severity: 62,
    confidence: 93,
    sentiment: "Neutral",
    risk: "Traffic accident risk",
    officer: "Thiru. M. Sathish, AEE (Highways)",
    duplicates: 0,
    aiSummary:
      "Post-monsoon surface failure producing three potholes on a high-traffic arterial road. Moderate severity with an accident risk concentrated during evening hours.",
    suggestedResponse:
      "The potholes on Race Course Road have been patched with cold-mix and the stretch is scheduled for resurfacing in the next maintenance cycle.",
    evidence: [{ name: "pothole-1.jpg", type: "image", size: "2.0 MB" }],
    timeline: [
      { stage: "step.submitted", at: "28 Jun, 17:40", note: "Filed by citizen" },
      { stage: "step.ai", at: "28 Jun, 17:40", note: "Analysed in 1.4s · confidence 93%" },
      { stage: "step.assigned", at: "28 Jun, 17:42", note: "Routed to Roads & Highways" },
      { stage: "step.review", at: "29 Jun, 10:15", note: "Accepted by AEE M. Sathish" },
      { stage: "step.progress", at: "01 Jul, 08:00", note: "Cold-mix patching crew deployed" },
      { stage: "step.resolved", at: "03 Jul, 16:20", note: "Closure photo uploaded by officer" },
    ],
  },
  {
    id: "TN-GRV-2026-005104",
    tracking: "TRK-88224417",
    mobile: "9500123478",
    citizen: "Fathima Begum",
    citizenEmail: "fathima.b@example.in",
    district: "Chennai",
    address: "Triplicane High Road, Ward 112",
    departmentId: "health",
    category: "Garbage clearance",
    title: "Garbage not cleared for five days near the market entrance",
    description:
      "Waste has been piling up at the market entrance for five days. Strong smell and stray dogs around the area.",
    filedOn: "20 Jul 2026, 07:22",
    eta: "22 Jul 2026, 12:00",
    stage: "step.assigned",
    priority: "high",
    severity: 74,
    confidence: 95,
    sentiment: "Concerned",
    risk: "Sanitation and disease risk",
    officer: "Tmt. S. Devi, Sanitary Inspector (Ward 112)",
    duplicates: 5,
    aiSummary:
      "Uncollected solid waste accumulating at a high-footfall market entrance for five days, with stray-animal congregation. Sanitation and vector-borne disease risk. Five related reports indicate a missed collection route rather than an isolated incident.",
    suggestedResponse:
      "The Ward 112 collection route has been re-scheduled and a special clearance vehicle will visit the market entrance today. Daily collection will resume from tomorrow.",
    evidence: [{ name: "garbage-pile.jpg", type: "image", size: "2.7 MB" }],
    timeline: [
      { stage: "step.submitted", at: "20 Jul, 07:22", note: "Filed by citizen" },
      { stage: "step.ai", at: "20 Jul, 07:22", note: "Analysed in 1.6s · confidence 95%" },
      { stage: "step.assigned", at: "20 Jul, 07:25", note: "Routed to Public Health, Ward 112" },
    ],
  },
];

export function findComplaint(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return undefined;
  return complaints.find(
    (c) =>
      c.id.toLowerCase() === q ||
      c.tracking.toLowerCase() === q ||
      c.mobile === q.replace(/\D/g, ""),
  );
}

export type Notification = {
  id: string;
  category: "status" | "message" | "alert" | "deadline" | "resolution";
  title: string;
  body: string;
  at: string;
  unread: boolean;
};

export const notifications: Notification[] = [
  {
    id: "n1",
    category: "status",
    title: "TN-GRV-2026-004812 moved to In Progress",
    body: "Feeder inspection scheduled for Sundarapuram 3rd Street.",
    at: "2 h ago",
    unread: true,
  },
  {
    id: "n2",
    category: "message",
    title: "Message from AE K. Anbarasan",
    body: "Our crew will reach your street between 4 PM and 6 PM today.",
    at: "3 h ago",
    unread: true,
  },
  {
    id: "n3",
    category: "alert",
    title: "AI detected 3 similar complaints",
    body: "Your street-light case was linked to a feeder-level fault cluster.",
    at: "Yesterday",
    unread: true,
  },
  {
    id: "n4",
    category: "deadline",
    title: "Resolution deadline in 36 hours",
    body: "TN-GRV-2026-004977 must be closed by 20 Jul, 12:00.",
    at: "Yesterday",
    unread: false,
  },
  {
    id: "n5",
    category: "resolution",
    title: "TN-GRV-2026-004503 resolved",
    body: "Potholes patched on Race Course Road. Closure photo attached.",
    at: "3 Jul",
    unread: false,
  },
];

export const officerQueue = complaints.filter((c) => c.stage !== "step.resolved");

export const trendData = [
  { day: "Mon", filed: 182, resolved: 164 },
  { day: "Tue", filed: 214, resolved: 190 },
  { day: "Wed", filed: 198, resolved: 205 },
  { day: "Thu", filed: 241, resolved: 212 },
  { day: "Fri", filed: 268, resolved: 244 },
  { day: "Sat", filed: 156, resolved: 171 },
  { day: "Sun", filed: 121, resolved: 138 },
];

export const priorityData = [
  { name: "Critical", value: 8 },
  { name: "High", value: 24 },
  { name: "Medium", value: 41 },
  { name: "Low", value: 27 },
];

export const performanceData = [
  { dept: "Electricity", sla: 98 },
  { dept: "Water", sla: 94 },
  { dept: "Health", sla: 91 },
  { dept: "Roads", sla: 84 },
  { dept: "Municipal", sla: 88 },
  { dept: "Revenue", sla: 76 },
];

export const heatmapZones = [
  "Ward 101",
  "Ward 102",
  "Ward 103",
  "Ward 104",
  "Ward 105",
  "Ward 106",
  "Ward 107",
  "Ward 108",
  "Ward 109",
  "Ward 110",
  "Ward 111",
  "Ward 112",
];

export const heatmapValues = [
  12, 34, 61, 22, 8, 47, 73, 19, 55, 31, 88, 42, 27, 15, 66, 39, 5, 51, 29, 78, 11, 44, 60, 23, 36,
  17, 82, 48, 13, 57, 25, 69, 40, 9, 53, 30,
];
