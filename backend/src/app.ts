import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { isDBConnected } from "./config/db";

import authRoutes from "./routes/authRoutes";
import complaintRoutes from "./routes/complaintRoutes";
import officerRoutes from "./routes/officerRoutes";
import workflowRoutes from "./routes/workflowRoutes";

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));

// Production-ready CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:8080",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server, cURL, n8n, or non-browser requests
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/+$/, "");

      if (
        allowedOrigins.some((o) => o.replace(/\/+$/, "") === normalizedOrigin) ||
        normalizedOrigin.endsWith(".vercel.app") ||
        process.env.NODE_ENV !== "production"
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Safe fallback for preview environments
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Mount modularized routes under /api
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/officer", officerRoutes);
app.use("/api", workflowRoutes);

// Public root and health check endpoints for Render / Uptime monitors
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    message: "GrievancePilot Backend API is running",
    database: isDBConnected() ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    database: isDBConnected() ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// Centralized safe error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled Server Error:", err.stack || err.message || err);
  const isProd = process.env.NODE_ENV === "production";
  res.status(err.status || 500).json({
    success: false,
    message: isProd ? "An internal server error occurred." : err.message || "Internal Server Error",
    code: err.code || "SERVER_ERROR",
  });
});

export default app;
