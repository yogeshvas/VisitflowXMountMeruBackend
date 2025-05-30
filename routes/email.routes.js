import express from "express";
import {
  createEmail,
  getEmails,
  sendEmailToClient,
  updateEmail,
} from "../controllers/email.controller.js";
import { roleMiddleware } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/", createEmail);
router.get("/", getEmails);
router.patch("/:id", roleMiddleware("admin"), updateEmail);
router.post("/send", sendEmailToClient);

export default router;
