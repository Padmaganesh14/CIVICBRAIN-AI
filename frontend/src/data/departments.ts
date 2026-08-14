import {
  Shield,
  Droplets,
  Zap,
  Construction,
  HeartPulse,
  Landmark,
  Bus,
  GraduationCap,
  Building2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Department = {
  id: string;
  nameKey: string;
  icon: LucideIcon;
  avgDays: number;
  accuracy: number;
  tint: string;
  categories: string[];
};

export const departments: Department[] = [
  {
    id: "police",
    nameKey: "dept.police",
    icon: Shield,
    avgDays: 2.4,
    accuracy: 97,
    tint: "from-primary/25 to-accent/20",
    categories: ["Public safety", "Noise nuisance", "Traffic violation", "Cyber fraud"],
  },
  {
    id: "water",
    nameKey: "dept.water",
    icon: Droplets,
    avgDays: 1.8,
    accuracy: 96,
    tint: "from-primary/25 to-secondary/25",
    categories: ["No water supply", "Contaminated water", "Pipeline leak", "Sewage overflow"],
  },
  {
    id: "electricity",
    nameKey: "dept.electricity",
    icon: Zap,
    avgDays: 1.2,
    accuracy: 98,
    tint: "from-warning/30 to-primary/20",
    categories: ["Power outage", "Street light", "Transformer fault", "Billing error"],
  },
  {
    id: "roads",
    nameKey: "dept.roads",
    icon: Construction,
    avgDays: 4.6,
    accuracy: 94,
    tint: "from-warning/25 to-accent/20",
    categories: ["Pothole", "Damaged footpath", "Missing signage", "Waterlogging"],
  },
  {
    id: "health",
    nameKey: "dept.health",
    icon: HeartPulse,
    avgDays: 2.1,
    accuracy: 95,
    tint: "from-secondary/30 to-primary/18",
    categories: ["Garbage clearance", "Mosquito control", "Food safety", "Stray animals"],
  },
  {
    id: "revenue",
    nameKey: "dept.revenue",
    icon: Landmark,
    avgDays: 6.3,
    accuracy: 92,
    tint: "from-accent/25 to-primary/20",
    categories: ["Patta transfer", "Certificate delay", "Land encroachment", "Survey dispute"],
  },
  {
    id: "transport",
    nameKey: "dept.transport",
    icon: Bus,
    avgDays: 3.2,
    accuracy: 93,
    tint: "from-primary/22 to-secondary/22",
    categories: ["Bus service", "Licence delay", "Overcharging", "Vehicle fitness"],
  },
  {
    id: "education",
    nameKey: "dept.education",
    icon: GraduationCap,
    avgDays: 5.1,
    accuracy: 91,
    tint: "from-accent/28 to-secondary/18",
    categories: ["School infrastructure", "Fee irregularity", "Mid-day meal", "Staff shortage"],
  },
  {
    id: "municipal",
    nameKey: "dept.municipal",
    icon: Building2,
    avgDays: 3.7,
    accuracy: 95,
    tint: "from-secondary/26 to-accent/20",
    categories: ["Property tax", "Building violation", "Park maintenance", "Drainage"],
  },
];

export const districts = [
  "Chennai",
  "Coimbatore",
  "Madurai",
  "Tiruchirappalli",
  "Salem",
  "Tirunelveli",
  "Erode",
  "Vellore",
  "Thanjavur",
  "Kanchipuram",
];
