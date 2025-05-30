import mongoose from "mongoose";

const clientOnboardingSchema = new mongoose.Schema(
  {
    doc1: {
      type: String,
      required: true,
    },
    doc2: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    clientName: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    comment: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Add text indexes for search functionality
clientOnboardingSchema.index({ email: "text", phoneNumber: "text", clientName: "text" });

// Use singular model name; Mongoose auto-pluralizes it (e.g., ClientOnboarding -> clientonboardings)
const ClientOnboarding = mongoose.model("ClientOnboarding", clientOnboardingSchema);

export default ClientOnboarding;