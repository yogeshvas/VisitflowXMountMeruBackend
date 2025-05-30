import mongoose from "mongoose";
import multer from "multer";
import cloudinary from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { Star } from "../models/star.model.js";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up Multer storage with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "stars",
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

const upload = multer({ storage: storage });

// Middleware for handling file upload
const uploadImage = upload.single("image");

// Create a new star
const createStar = async (req, res) => {
  try {
    const { name, tagline } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const newStar = new Star({
      name,
      tagline,
      image: req.file.path, // Cloudinary URL
    });

    await newStar.save();
    res.status(201).json(newStar);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all stars
const getAllStars = async (req, res) => {
  try {
    const stars = await Star.find().sort({ createdAt: -1 });
    res.status(200).json(stars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single star by ID
const getStarById = async (req, res) => {
  try {
    const star = await Star.findById(req.params.id);
    if (!star) {
      return res.status(404).json({ message: "Star not found" });
    }
    res.status(200).json(star);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a star
const updateStar = async (req, res) => {
  try {
    const { name, tagline } = req.body;
    const updateData = { name, tagline };

    // If a new image is uploaded, add it to the update data
    if (req.file) {
      updateData.image = req.file.path;
      
      // Optional: Delete the old image from Cloudinary
      const oldStar = await Star.findById(req.params.id);
      if (oldStar.image) {
        const publicId = oldStar.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`stars/${publicId}`);
      }
    }

    const updatedStar = await Star.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedStar) {
      return res.status(404).json({ message: "Star not found" });
    }

    res.status(200).json(updatedStar);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a star
const deleteStar = async (req, res) => {
  try {
    const star = await Star.findByIdAndDelete(req.params.id);

    if (!star) {
      return res.status(404).json({ message: "Star not found" });
    }

    // Delete the image from Cloudinary
    if (star.image) {
      const publicId = star.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`stars/${publicId}`);
    }

    res.status(200).json({ message: "Star deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  createStar,
  getAllStars,
  getStarById,
  updateStar,
  deleteStar,
  uploadImage,
};