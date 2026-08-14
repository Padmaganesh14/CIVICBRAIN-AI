import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    username: string;
    role: "citizen" | "officer";
    department?: string;
    tokenVersion: number;
  };
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "Unauthorized access. Token required." });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "super_secret_jwt_key_tn_grievance_2026") as any;
    
    // Server-side token invalidation check via tokenVersion
    const dbUser = await User.findById(decoded.userId).select("tokenVersion role department username");
    if (!dbUser || dbUser.tokenVersion !== decoded.tokenVersion) {
      res.status(401).json({ success: false, message: "Token has been invalidated / logged out. Please log in again." });
      return;
    }

    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      role: dbUser.role,                  // always live from DB
      department: dbUser.department ?? decoded.department, // prefer live DB value
      tokenVersion: decoded.tokenVersion,
    };
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid or expired authorization token." });
  }
};

export const requireRole = (role: "citizen" | "officer") => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.role !== role) {
      res.status(403).json({ success: false, message: `Forbidden. Requires ${role} role.` });
      return;
    }
    next();
  };
};
