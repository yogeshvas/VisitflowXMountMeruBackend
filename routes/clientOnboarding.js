import express from "express";

import {  authMiddleware } from "../middleware/auth.middleware.js";
import { createClientOnboarding, deleteClientOnboarding, getAllClientOnboardings, getClientOnboardingById, getMyClients, searchClients, updateClientOnboarding, updateClientStatus, uploadDocuments } from "../controllers/clientOnboarding.controller.js";

const router = express.Router();

// Create a new client onboarding - requires authentication
router.post(
  "/",
  authMiddleware,
  uploadDocuments,
  createClientOnboarding
);

// Get all client onboardings with pagination - admin only
router.get(
  "/all",
  authMiddleware,
  getAllClientOnboardings
);

// Get my clients (for logged in user)
router.get(
  "/my-clients",
  authMiddleware,
  getMyClients
);

// Search clients by email, phone number, or name
router.get(
  "/search",
  authMiddleware,
  searchClients
);

// Get a single client onboarding by ID
router.get(
  "/:id",
  authMiddleware,
  getClientOnboardingById
);

// Update a client onboarding
router.put(
  "/:id",
  authMiddleware,
  uploadDocuments,
  updateClientOnboarding
);

// Update client status (admin only)
router.patch(
  "/:id/status",
  authMiddleware,
  updateClientStatus
);

// Delete a client onboarding
router.delete(
  "/:id",
  authMiddleware,
  deleteClientOnboarding
);

export default router;