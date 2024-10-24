import mongoose from "mongoose";

export const messageSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
    },
    user_id: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    created_at: {
        type: Number,
        required: true,
    },
} as const);
