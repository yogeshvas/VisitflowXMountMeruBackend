import mongoose from "mongoose";


const taskSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    type:{
        type: String,
        enum: ["operation","sales","maintenance","training","other"],
        required: true
    },
    client:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
    },
    description:{
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String, 
        required: true
    },
    status:{
        type: String,
        enum: ["pending","completed","in-progress"],
        default: "pending"
    },
    product:{
        type: String,
        required: true
    }
}, {timestamps: true})


export const Task = new mongoose.model("Task", taskSchema)