import mongoose from "mongoose";
const VisitSchema = new mongoose.Schema(
  {
    sales_rep: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    check_in_time: { type: Date, required: true },
    duration: { type: Number }, // In minutes
    comments: { type: String },
  },
  { timestamps: true }
);

export const Visit = mongoose.model("Visit", VisitSchema);
