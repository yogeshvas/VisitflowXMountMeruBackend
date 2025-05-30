import express from "express";
import { add_visit } from "../controllers/visit.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route("/").post(authMiddleware, add_visit);


export default router;
