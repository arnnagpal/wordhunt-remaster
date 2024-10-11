import mongoose from "mongoose";

export const gameSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            required: true,
        },
        session_type: {
            type: Number,
            required: true,
        },
        players: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
        winner: {
            type: String,
            required: false,
        },
        board: {
            type: String,
            required: true,
        },
        timer: {
            type: Number,
            required: true,
        },
        created_at: {
            type: Number,
            required: true,
        },
        ended_at: {
            type: Number,
            required: false,
        },
        single_player: {
            type: Boolean,
            required: true,
        },
    } as const,
    { _id: false }
);
