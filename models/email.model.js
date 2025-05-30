import mongoose from "mongoose";

const emailSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["proposal", "pricing"],
    },
  },
  { timestamps: true }
);

export const Email = mongoose.model("Email", emailSchema);
