import mongoose from "mongoose";

export const dailySchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            required: true,
        },
        board: {
            type: String,
            required: true,
        },
        timer: {
            type: Number,
            required: true,
        },
        started_at: {
            type: Number,
            required: true,
        },
        ends_at: {
            type: Number,
            required: false,
        },
        participants: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
    } as const,
    { _id: false }
);
