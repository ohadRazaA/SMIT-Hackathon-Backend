import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import {
  uploadAndAnalyzeReport,
  getReportsForMember,
} from "../controllers/reportController.js";

const router = express.Router();

// Upload + analyze a medical report PDF for a specific member
router.post(
  "/:memberId/reports",
  authMiddleware,
  upload.single("report"),
  uploadAndAnalyzeReport
);

// Get all reports (and AI analyses) for a member
router.get("/:memberId/reports", authMiddleware, getReportsForMember);

export default router;


