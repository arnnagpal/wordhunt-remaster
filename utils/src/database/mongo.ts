import mongoose from "mongoose";
import { gameSchema } from "../mongo/schemas/game";
import { userSchema } from "../mongo/schemas/user";
import { Game } from "../types/game";
import { User } from "../types/user";
import { leaderboardSchema } from "../mongo/schemas/leaderboard";
import { LeaderboardRecord } from "../types/leaderboard";

export class MongoClient {
    private connectionString: string;
    public User: mongoose.Model<User>;
    public Game: mongoose.Model<Game>;
    public Leaderboard: mongoose.Model<LeaderboardRecord>;

    constructor(connectionString: string) {
        if (!connectionString) {
            throw new Error("connectionString is not defined - mongo");
        }
        this.connectionString = connectionString;

        this.User = mongoose.models.user || mongoose.model("user", userSchema);
        this.Game = mongoose.models.game || mongoose.model("game", gameSchema);
        this.Leaderboard =
            mongoose.models.leaderboard ||
            mongoose.model("leaderboard", leaderboardSchema);
    }

    async connect() {
        await mongoose.connect(this.connectionString);
    }

    async close() {
        await mongoose.disconnect();
    }
}
