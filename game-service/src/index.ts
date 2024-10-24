import dotenv from "dotenv";
import { Elysia } from "elysia";
import { MongoClient, RedisClient } from "wordhunt-utils/src/server";
import {
    broadcastOnlineUsers,
    broadcastQueuedUsers,
    createWebSocket,
} from "./socket";
import {
    getAllGamesLength,
    getGame,
    loadGameHistory,
    saveGameHistory,
} from "./game/game";
import { loadDictionary } from "wordhunt-utils/src/dictionary/letters";
import { setupMatchmaking } from "./game/matchmaking";
import {
    getLeaders,
    getUserScore,
    loadLeaderboard,
    reloadLeaderboard,
} from "./game/leaderboard";
import cors from "@elysiajs/cors";
import { getMessages, loadMessages } from "./game/chat";
import {
    getCurrentDaily,
    getDailyLeaderboard,
    loadDailies,
} from "./game/daily";

dotenv.config();

const secretString = process.env.JWT_SECRET;
if (!secretString) {
    throw new Error("JWT_SECRET not set");
}

const encoder = new TextEncoder();
const secret = encoder.encode(secretString);

const redisURL = process.env.REDIS_URL;
if (!redisURL) {
    throw new Error("REDIS_URL not set");
}

const mongoURL = process.env.MONGO_URL;
if (!mongoURL) {
    throw new Error("MONGO_URL not set");
}

// connect to redis
const redis = new RedisClient(redisURL);
await redis.connect();

// connect to mongo
export const mongo = new MongoClient(mongoURL);
await mongo.connect();

await loadDictionary();

// load game history
await loadGameHistory();
await loadDailies();

await loadLeaderboard();
await reloadLeaderboard();
setupMatchmaking();

await loadMessages();

const server = new Elysia({
    serve: {
        hostname: process.env.HOSTNAME,
    },
});

server.get(
    process.env.ORIGIN_PREFIX + "/game/daily-status",
    async (req: any) => {
        let daily: any = getCurrentDaily();
        // deep copy daily to avoid modifying the original
        daily = JSON.parse(JSON.stringify(daily));

        delete daily.participants;
        delete daily.board;
        delete daily._id;
        delete daily.__v;
        return new Response(JSON.stringify(daily), {
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
);

server.get(process.env.ORIGIN_PREFIX + "/game/:id/status", async (req: any) => {
    const gameID = req.params.id;

    const game = getGame(gameID);
    if (!game) {
        return new Response(
            JSON.stringify({
                error: "Game not found",
            }),
            {
                status: 404,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    }

    // deep copy game to avoid modifying the original
    const publicGame = JSON.parse(JSON.stringify(game));

    publicGame.board = JSON.parse(publicGame.board);

    publicGame.players = JSON.parse(JSON.stringify(publicGame.players));

    for (const player of publicGame.players) {
        delete player.game_id;
        delete player.letters_selected;
        delete player.time_left;
    }

    return new Response(JSON.stringify(publicGame), {
        headers: {
            "Content-Type": "application/json",
        },
    });
});

server.get(process.env.ORIGIN_PREFIX + "/leaderboard/avgscore", async () => {
    const leaders = getLeaders(20);

    return new Response(JSON.stringify(leaders), {
        headers: {
            "Content-Type": "application/json",
        },
    });
});

server.get(process.env.ORIGIN_PREFIX + "/leaderboard/daily", async () => {
    const leaders = await getDailyLeaderboard();

    return new Response(JSON.stringify(leaders), {
        headers: {
            "Content-Type": "application/json",
        },
    });
});

server.get(process.env.ORIGIN_PREFIX + "/chat", async () => {
    let messages: any[] = await getMessages(20);

    messages = messages.map((m) => ({
        username: m.username,
        message: m.message,
        created_at: m.created_at,
        avgScore: getUserScore(m.user_id),
    }));

    return new Response(JSON.stringify(messages), {
        headers: {
            "Content-Type": "application/json",
        },
    });
});

createWebSocket(server, secret, redis, mongo);

setInterval(async () => {
    await broadcastOnlineUsers(server);
    await broadcastQueuedUsers(server);
}, 3000);

process.on("SIGINT", async () => {
    console.log("Received SIGINT, exiting gracefully");
    server.stop();
    process.exit(0);
});
process.on("exit", async () => {
    console.log(`Saving ${getAllGamesLength()} games`);
    saveGameHistory();
});

server.listen(Number.parseInt(process.env.PORT || "3000"), (s) => {
    console.log(`Listening on ${s.hostname}:${s.port}`);
});
