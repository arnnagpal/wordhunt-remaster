import mongoose from "mongoose";

export const leaderboardSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
        },
        score: {
            type: Number,
            required: true,
        },
    } as const,
    { _id: false }
);
