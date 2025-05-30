import express from "express"
import { addReview, myReviews } from "../controllers/review.controller.js"
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router()


router.route("/").post(addReview);
router.route("/my-reviews").get(authMiddleware,myReviews);

export default router