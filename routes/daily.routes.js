import express from "express"
import { authMiddleware } from "../middleware/auth.middleware.js"
import { endAttendance, getAttendanceStatus, getDailyRecords, getReportFromTimestamp, startAttendance } from "../controllers/dailyRecord.contoller.js"

const router = express.Router()

router.route("/").get(authMiddleware, getDailyRecords);
router.route("/start").post(authMiddleware, startAttendance);
router.route("/end").post(authMiddleware, endAttendance);
router.route("/status").get(authMiddleware, getAttendanceStatus);
router.route("/generate-report").post(authMiddleware, getReportFromTimestamp);

export default router;