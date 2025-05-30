import express from "express";
import { createStar, deleteStar, getAllStars, getStarById, updateStar, uploadImage } from "../controllers/star.controller.js";


const router = express.Router();

// Create a new star (with image upload)
router.post("/",uploadImage, createStar);

// Get all stars
router.get("/", getAllStars);

// Get a single star
router.get("/:id", getStarById);

// Update a star (with optional image upload)
router.put("/:id", uploadImage, updateStar);

// Delete a star
router.delete("/:id", deleteStar);

export default router;