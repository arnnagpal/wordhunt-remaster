import mongoose from "mongoose";

export class MongoGamePlayer extends mongoose.SchemaType {
    id!: string;
    words!: string[];
    score!: number;

    constructor(key: string, options: mongoose.AnyObject | undefined) {
        super(key, options, "GamePlayer");
    }

    cast(val: any) {
        if (val == null) return {};
        if (typeof val !== "object") {
            throw new Error("GamePlayer: val is not an object");
        }

        // check if val is a valid GamePlayer object
        if (!val.id || !val.words || typeof val.score !== "number") {
            throw new Error(
                "GamePlayer: val is not a valid GamePlayer object, types: " +
                    typeof val.id +
                    ", " +
                    typeof val.words +
                    ", " +
                    typeof val.score +
                    ", " +
                    typeof val.lettersSelected +
                    ", " +
                    typeof val.time_left +
                    ", " +
                    typeof val.score
            );
        }

        return {
            id: val.id,
            words: val.words,
            score: val.score,
        };
    }
}