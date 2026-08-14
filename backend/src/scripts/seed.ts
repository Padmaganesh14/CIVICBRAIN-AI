import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { Department } from "../models/Workflow";

const DEPARTMENTS = [
  { departmentId: "DEP001", departmentName: "Road Department", officerEmail: "road@municipality.gov" },
  { departmentId: "DEP002", departmentName: "Water Supply Department", officerEmail: "water@municipality.gov" },
  { departmentId: "DEP003", departmentName: "Electricity Department", officerEmail: "electricity@municipality.gov" },
  { departmentId: "DEP004", departmentName: "Sanitation Department", officerEmail: "sanitation@municipality.gov" },
  { departmentId: "DEP005", departmentName: "Drainage Department", officerEmail: "drainage@municipality.gov" },
  { departmentId: "DEP006", departmentName: "Public Health Department", officerEmail: "health@municipality.gov" },
  { departmentId: "DEP007", departmentName: "Revenue Department", officerEmail: "revenue@municipality.gov" },
  { departmentId: "DEP008", departmentName: "Transport Department", officerEmail: "transport@municipality.gov" },
  { departmentId: "DEP009", departmentName: "Education Department", officerEmail: "education@municipality.gov" },
  { departmentId: "DEP010", departmentName: "Municipal Corporation", officerEmail: "admin@municipality.gov" },
];

const seed = async () => {
  try {
    const connStr = process.env.MONGODB_URI;
    if (!connStr || connStr.includes("YourPassword")) {
      console.error("❌ MONGODB_URI is not configured in .env. Skipping seed.");
      process.exit(1);
    }

    await mongoose.connect(connStr);
    console.log("🌱 Connected to MongoDB for seeding...");

    // Seed Departments
    for (const dept of DEPARTMENTS) {
      await Department.findOneAndUpdate({ departmentId: dept.departmentId }, dept, { upsert: true, new: true });
    }
    console.log("✅ Seeded Departments.");

    // Seed Demo Citizen
    const citizenPassword = await bcrypt.hash("Citizen@123", 10);
    await User.findOneAndUpdate(
      { username: "citizen01" },
      {
        username: "citizen01",
        passwordHash: citizenPassword,
        name: "Demonstration Citizen",
        phone: "9876543210",
        role: "citizen",
      },
      { upsert: true, new: true }
    );
    console.log("👤 Seeded Citizen user: username = citizen01 | password = Citizen@123");

    // Seed Pre-authorized Officer 'ganesh'
    const ganeshPassword = await bcrypt.hash("Ganesh@123", 10);
    await User.findOneAndUpdate(
      { username: "ganesh" },
      {
        username: "ganesh",
        email: "ganesh@tn.gov.in",
        passwordHash: ganeshPassword,
        name: "Ganesh",
        phone: "9876543210",
        role: "officer",
        department: "Road Department",
        tokenVersion: 1,
      },
      { upsert: true, new: true }
    );
    console.log("👮 Seeded Officer user: username = ganesh | email = ganesh@tn.gov.in | password = Ganesh@123 | department = Road Department");

    // Seed Demo Officer 'road_officer01'
    const officerPassword = await bcrypt.hash("Officer@123", 10);
    await User.findOneAndUpdate(
      { username: "road_officer01" },
      {
        username: "road_officer01",
        email: "road@municipality.gov",
        passwordHash: officerPassword,
        name: "Road Department Officer",
        phone: "9876543211",
        role: "officer",
        department: "Road Department",
        tokenVersion: 1,
      },
      { upsert: true, new: true }
    );
    console.log("👮 Seeded Officer user: username = road_officer01 | email = road@municipality.gov | password = Officer@123 | department = Road Department");

    // Seed Pre-authorized Officer 'arun_officer'
    const arunPassword = await bcrypt.hash("Arun@12345", 10);
    await User.findOneAndUpdate(
      { username: "arun_officer" },
      {
        username: "arun_officer",
        email: "arun@tn.gov.in",
        passwordHash: arunPassword,
        name: "Arun Kumar",
        phone: "9876543212",
        role: "officer",
        department: "Water Supply Department",
        tokenVersion: 1,
      },
      { upsert: true, new: true }
    );
    console.log("👮 Seeded Officer user: username = arun_officer | email = arun@tn.gov.in | password = Arun@12345 | department = Water Supply Department");

    console.log("🚀 Seeding finished successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
};

seed();
