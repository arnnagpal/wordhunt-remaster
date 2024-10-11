import { createClient } from "redis";
import { Repository, type Entity } from "redis-om";
import { sessionSchema, type RedisSession } from "../redis/schema/session";

export class RedisClient {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private client: any;

    public sessionRepository;

    constructor(connectionString: string) {
        if (!connectionString) {
            throw new Error("connectionString is not defined - redis");
        }

        this.client = createClient({ url: connectionString });
        this.client.on("error", (err: unknown) =>
            console.log("Redis Client Error", err)
        );

        this.sessionRepository = new Repository(sessionSchema, this.client);
    }

    async connect() {
        await this.client.connect();
        await this.sessionRepository.createIndex();

        console.log("Redis connected");
    }

    async getSession(sessionId: string): Promise<RedisSession | null> {
        const session = await this.getSessionEntity(sessionId);

        return session
            ? ({
                  id: session.id,
                  user_id: session.user_id,
                  expires_at: session.expires_at,
                  login_at: session.login_at,
                  jwt: session.jwt,
              } as RedisSession)
            : null;
    }

    async getSessionEntity(sessionId: string): Promise<Entity | null> {
        return await this.sessionRepository
            .search()
            .where("id")
            .eq(sessionId)
            .where("expires_at")
            .gt(Date.now() / 1000)
            .returnFirst();
    }

    async ping() {
        return await this.client.ping();
    }

    getClient() {
        return this.client;
    }

    async close() {
        await this.client.quit();
    }
}
