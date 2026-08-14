import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { User } from "../models/User";
import { AuthRequest } from "../middleware/authMiddleware";
import { isDBConnected } from "../config/db";

const DB_DISCONNECTED_MSG = "Database is not connected. Please check your backend/.env MONGODB_URI and ensure your IP is whitelisted in MongoDB Atlas (0.0.0.0/0).";

export const registerCitizen = async (req: Request, res: Response): Promise<void> => {
  if (!isDBConnected()) {
    res.status(503).json({ success: false, message: DB_DISCONNECTED_MSG });
    return;
  }
  try {
    const { username, password, name, phone } = req.body;


    if (!username || !password || !name) {
      res.status(400).json({ success: false, message: "Username, password and name are required." });
      return;
    }

    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ success: false, message: "Username already exists." });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Hardcode role to citizen - PUBLIC REGISTRATION CAN NEVER ASSIGN OFFICER ROLE
    const newUser = await User.create({
      username: username.toLowerCase(),
      passwordHash,
      name,
      phone,
      role: "citizen",
      tokenVersion: 1,
    });

    res.status(201).json({
      success: true,
      message: "Citizen registered successfully. Please log in.",
      data: {
        id: newUser._id,
        username: newUser.username,
        name: newUser.name,
        role: newUser.role,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Registration failed." });
  }
};

export const loginCitizen = async (req: Request, res: Response): Promise<void> => {
  if (!isDBConnected()) {
    res.status(503).json({ success: false, message: DB_DISCONNECTED_MSG });
    return;
  }
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ success: false, message: "Username and password are required." });
      return;
    }

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user || user.role !== "citizen") {
      res.status(401).json({ success: false, message: "Invalid citizen credentials." });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Invalid citizen credentials." });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET || "super_secret_jwt_key_tn_grievance_2026";
    const signOptions: SignOptions = { expiresIn: "1d" };

    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        role: "citizen",
        tokenVersion: user.tokenVersion,
      },
      jwtSecret,
      signOptions
    );

    res.status(200).json({
      success: true,
      message: "Citizen login successful.",
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
          role: "citizen",
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Login failed." });
  }
};

export const loginOfficer = async (req: Request, res: Response): Promise<void> => {
  if (!isDBConnected()) {
    res.status(503).json({ success: false, message: DB_DISCONNECTED_MSG });
    return;
  }
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ success: false, message: "Username and password are required." });
      return;
    }

    const cleanInput = String(username).trim().toLowerCase();
    const handle = cleanInput.split("@")[0] || cleanInput;

    const user = await User.findOne({
      $or: [
        { username: cleanInput },
        { username: handle },
        { email: cleanInput },
      ],
    });

    if (!user || user.role !== "officer") {
      res.status(401).json({ success: false, message: "Invalid officer credentials." });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Invalid officer credentials." });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET || "super_secret_jwt_key_tn_grievance_2026";
    const signOptions: SignOptions = { expiresIn: "1d" };

    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        role: "officer",
        department: user.department,
        tokenVersion: user.tokenVersion,
      },
      jwtSecret,
      signOptions
    );

    res.status(200).json({
      success: true,
      message: "Officer login successful.",
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
          role: "officer",
          department: user.department,
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Officer login failed." });
  }
};

export const logoutUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated." });
      return;
    }

    // Server-side invalidation: Increment tokenVersion
    await User.findByIdAndUpdate(req.user.userId, { $inc: { tokenVersion: 1 } });

    res.status(200).json({ success: true, message: "Logged out successfully. Server-side token invalidated." });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated." });
      return;
    }
    const user = await User.findById(req.user.userId).select("-passwordHash");
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }
    res.status(200).json({ success: true, data: user });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
