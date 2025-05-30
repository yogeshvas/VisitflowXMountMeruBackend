import mongoose from "mongoose";
const ClientSchema = new mongoose.Schema(
  {
    company_name: { type: String, required: true },
    address: { type: String, required: true },
    contact_person: { type: String, required: true },
    contact_email: { type: String, required: true },
    contact_phone: { type: String, required: true },
    category: { type: String, required: true },
    status: {
      type: String,
      enum: ["Active", "Proposal Sent", "Pricing Sent", "Closed", "Follow-Up-Met","Declined","Follow-Up-Not-Met","Other"],
      required: true,
      default: "Active",
    },
    fleet_size : {
      type: String,
    },
    best_for: [{ type: String, required: true }],
    no_of_employees: { type: Number, required: true },
    comment: { type: String },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    follow_up_dates: [
      {
        date: { type: Date },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    visits: [{ type: mongoose.Schema.Types.ObjectId, ref: "Visit" }],
  },
  { timestamps: true }
);

// Create a geospatial index for location
ClientSchema.index({ location: "2dsphere" });

export const Client = mongoose.model("Client", ClientSchema);
