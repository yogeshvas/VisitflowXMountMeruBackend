import express from "express";
import { register, login, logout, forgotPassword } from "../controllers/auth.controller.js";
import { refreshToken } from "../utils/tokenUtils.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/refresh").post(refreshToken);
router.route("/logout").post(logout);
router.route("/forgot-password").post(authMiddleware,forgotPassword);
export default router;
