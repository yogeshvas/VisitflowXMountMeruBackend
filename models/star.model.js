import mongoose from "mongoose";


export const starSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    tagline:{
        type: String,
        required: true
    },
    image:{
        type: String,
        required: true
    },

},{timestamps: true})

export const Star = mongoose.model("Star", starSchema)