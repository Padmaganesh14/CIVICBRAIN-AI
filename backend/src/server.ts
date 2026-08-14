import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDB } from "./config/db";

const PORT = Number(process.env.PORT || 5000);
const HOST = "0.0.0.0";

connectDB().then(() => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes("YOUR_GEMINI_API_KEY")) {
    console.warn("⚠️ GEMINI_API_KEY is not configured. AI eligibility analysis is disabled.");
  }
  app.listen(PORT, HOST, () => {
    console.log(`🚀 GrievancePilot Backend API listening on http://${HOST}:${PORT}`);
  });
});
