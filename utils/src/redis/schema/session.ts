import { Schema } from "redis-om";

export interface RedisSession {
    id: string;
    user_id: string;
    expires_at: Date;
    login_at: Date;
    jwt?: string;
}

export const sessionSchema = new Schema("session", {
    id: {
        type: "string",
        caseSensitive: true,
    },
    user_id: {
        type: "string",
        caseSensitive: true,
    },
    expires_at: {
        type: "date",
    },
    login_at: {
        type: "date",
    },
    jwt: {
        type: "string",
        caseSensitive: true,
    },
});
