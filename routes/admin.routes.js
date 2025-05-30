import express from 'express';
import {  getUserAttendance, userReport, UserVisits } from '../controllers/admin.controllers.js';

const router = express.Router();

router.route("/user").get(userReport);
router.route("/get-user-visits").get(UserVisits);
router.route("/user-attendance").get(getUserAttendance)
export default router;