import mongoose from "mongoose";

const dailyRecordSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    startDateTime: {
        type: Date,
      
    },
    endDateTime: {
        type: Date,
      
    },
    startLocation: {
        lat: {
            type: Number,
            required: true
        },
        lng: {
            type: Number,
            required: true
        }
    },
    endLocation: {
        lat: {
            type: Number,
          
        },
        lng: {
            type: Number,
           
        }
    },
    kmTravelled: {
        type: Number,
        min: 0 // Ensure the value is non-negative
    }
}, { timestamps: true });

export const DailyRecord = mongoose.model("DailyRecord", dailyRecordSchema);