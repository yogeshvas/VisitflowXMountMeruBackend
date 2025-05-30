import mongoose from "mongoose"

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    review: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
        required: true
    }
},{timestamps: true})

export const Review = mongoose.model("Review", reviewSchema)
