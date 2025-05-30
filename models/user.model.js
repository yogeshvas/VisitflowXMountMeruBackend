import mongoose from "mongoose";
import Joi from "joi";

// User Schema
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "manager", "user"],
      default: "user",
      required: true,
    },
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    total_visits: {
      type: Number,
      default: 0,
    },
    visits: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Visit",
      },
    ],
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // References the Manager
      default: null, // Only applies for sales representatives
    },
    my_clients : [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    }],
    
    team: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // References Sales Representatives under this Manager
      },
    ],
    ratings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    avg_rating: {
      type: Number,
      default: 5,
    },
    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
  },
 
  { timestamps: true }
);

// Static method for validating user login input
UserSchema.statics.validateLogin = function (data) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });

  return schema.validate(data);
};

export const User = mongoose.model("User", UserSchema);
