import Elysia from "elysia";
import { TypedArray } from "oslo";
import { validateJWT } from "oslo/jwt";
import { MongoClient, RedisClient } from "wordhunt-utils/src/server";
import { handleAction } from "./handlers/action";
import { handleUpdates } from "./handlers/updates";

export interface WebSocketUser {
    session_token: string;
    id: string;
    username: string;
    display_name: string;
    rating: number;
    rating_deviation: number;
    rating_volatility: number;
}

export interface Rooms {
    [key: string]: any;
}

export const connectedUsers: { [key: string]: any } = {};
export const rooms: Rooms = {};

export function createWebSocket(
    server: Elysia,
    secret: ArrayBuffer | TypedArray,
    redis: RedisClient,
    mongo: MongoClient
) {
    server.ws("/ws", {
        async beforeHandle(req) {
            if (!req.headers) {
                return new Response("Unauthorized (invalid jwt)", {
                    status: 401,
                });
            }

            let authToken = req.headers["authorization"];

            if (req.headers["sec-websocket-protocol"]) {
                console.log("Protocol header found, using it as authToken");
                authToken = req.headers["sec-websocket-protocol"];
            }

            if (!authToken) {
                return new Response("Unauthorized", { status: 401 });
            }

            // check if authToken is valid
            const token = authToken;

            // decode jwt
            try {
                var jwt = await validateJWT("HS256", secret, token);
            } catch {
                console.log("Invalid jwt");
                // invalid signature, expired, or inactive
                return new Response("Unauthorized", { status: 401 });
            }

            const session = await redis.getSession(
                (jwt.payload as any).session_token
            );

            if (!session) {
                console.log("Session not found");
                return new Response("Unauthorized", { status: 401 });
            }

            const user = await mongo.User.findById(session.user_id).exec();

            if (!user) {
                console.log("User not found");
                return new Response("Unauthorized", { status: 401 });
            }

            // check if already logged in
            if (connectedUsers[user.id]) {
                // disconnect the previous connection
                connectedUsers[user.id].raw.close(
                    4000,
                    "Another device connected"
                );

                // delete the previous connection
                delete connectedUsers[user.id];

                console.log(
                    `User ${user.username} connected from another device`
                );
            }

            req.store = {
                session_token: session.id,
                id: user.id,
                username: user.username,
                display_name: user.display_name,
                rating: user.rating,
                rating_deviation: user.rating_deviation,
                rating_volatility: user.rating_volatility,
            } as WebSocketUser;
        },
        async open(ws) {
            const userData = ws.data.store as WebSocketUser;
            connectedUsers[userData.id] = ws;
        },
        async message(ws: any, message: any) {
            const data = message;

            if (data.action) {
                // handle action
                handleAction(server, ws, message);
            } else if (data.updateType) {
                // handle updates
                handleUpdates(server, ws, message);
            }
        },
        close(ws: any, code: any, reason: any) {
            const userData = ws.data.store as WebSocketUser;

            // remove from connected users
            delete connectedUsers[userData.id];

            console.log(
                `User ${userData.username} disconnected; Code: ${code}; Reason: "${reason}"`
            );
        },
    });
}
