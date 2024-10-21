import mongoose from "mongoose";
import { toLower } from "../../utils";

export const userSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            set: toLower,
        },
        username: {
            type: String,
            required: true,
            set: toLower,
        },
        display_name: {
            type: String,
            required: true,
        },
        password_hash: {
            type: String,
            required: true,
        },

        best_game: {
            type: {
                game_id: {
                    type: String,
                    required: true,
                },
                score: {
                    type: Number,
                    required: true,
                },
            },
            required: true,
        },

        // glicko-2 rating system
        rating: {
            type: Number,
            required: true,
        },
        rating_deviation: {
            type: Number,
            required: true,
        },
        rating_volatility: {
            type: Number,
            required: true,
        },
        games: {
            type: [String],
            required: true,
        },
        role: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
    } as const,
    { _id: false }
);
