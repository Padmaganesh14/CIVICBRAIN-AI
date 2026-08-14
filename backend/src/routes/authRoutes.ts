import express from "express";
import { registerCitizen, loginCitizen, loginOfficer, logoutUser, getMe } from "../controllers/authController";
import { requireAuth } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/citizen/register", registerCitizen);
router.post("/citizen/login", loginCitizen);
router.post("/officer/login", loginOfficer);
router.post("/logout", requireAuth, logoutUser);
router.get("/me", requireAuth, getMe);

export default router;
