import { userSchema } from "../mongo/schemas/user";
import { gameSchema } from "../mongo/schemas/game";

import { type RedisSession, sessionSchema } from "../redis/schema/session";

import { RedisClient } from "../database/redis";
import { MongoClient } from "../database/mongo";

// mongo exports
export { userSchema, gameSchema };

// redis exports
export { RedisSession, sessionSchema };

export { RedisClient, MongoClient };
