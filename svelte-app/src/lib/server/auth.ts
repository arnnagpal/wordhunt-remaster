import { Lucia, generateSessionId, type DatabaseAdapter, type SessionAndUser } from 'lucia';
import { RedisClient, MongoClient } from 'wordhunt-utils/src/server';
import { EntityId } from 'redis-om';
import { createJWT } from 'oslo/jwt';
import { TimeSpan } from 'oslo';
import { type User, type Session } from '../authTypes';
import { configDotenv } from 'dotenv';
import process from "node:process";

configDotenv();

if (!process.env.REDIS_URL) {
	throw new Error('REDIS_URL is not defined');
}

if (!process.env.MONGO_URL) {
	throw new Error('MONGO_URL is not defined');
}

export const redisClient = new RedisClient(process.env.REDIS_URL);
await redisClient.connect();

export const mongoClient = new MongoClient(process.env.MONGO_URL);
await mongoClient.connect();

const adapter: DatabaseAdapter<Session, User> = {
	getSessionAndUser: async (sessionId: string): Promise<SessionAndUser<Session, User>> => {
		// get session from redis
		const redisSession = await redisClient.getSession(sessionId);
		if (!redisSession) {
			return { session: null, user: null };
		}
		// get user from mongo
		const userDocument = await mongoClient.User.findById(redisSession.user_id).exec();
		if (!userDocument) {
			return { session: null, user: null };
		}

		const user: User = {
			id: userDocument._id,
			email: userDocument.email,
			username: userDocument.username,
			display_name: userDocument.display_name,
			rating: userDocument.rating,
			games: userDocument.games
		};

		if (!redisSession.jwt) {
			const jwt = await generateJWT(redisSession.id, redisSession.user_id, redisSession.expires_at);
			redisSession.jwt = jwt;
			await redisClient.sessionRepository.save(redisSession);
		}

		const session: Session = {
			id: redisSession.id,
			userId: redisSession.user_id,
			loginAt: new Date(redisSession.login_at.getTime() * 1000),
			expiresAt: new Date(redisSession.expires_at.getTime() * 1000),
			jwt: redisSession.jwt
		};

		return { session, user };
	},
	deleteSession: async (sessionId: string): Promise<void> => {
		// get entity from redis
		const session = await redisClient.getSessionEntity(sessionId);
		if (!session) {
			return;
		}

		await redisClient.sessionRepository.remove(<string>session[EntityId]);
	},
	updateSessionExpiration: async (sessionId: string, expiresAt: Date): Promise<void> => {
		// get entity from redis
		const session = await redisClient.getSessionEntity(sessionId);
		if (!session) {
			return;
		}

		session.expires_at = expiresAt;
		await redisClient.sessionRepository.save(session);
	}
};

export const lucia = new Lucia(adapter, {
	secureCookies: false
});

export async function createSession(userId: string): Promise<Session> {
	const session_token = generateSessionId();
	const expires = lucia.getNewSessionExpiration();

	const jwt = await generateJWT(session_token, userId, expires);

	const session: Session = {
		id: session_token,
		userId: userId,
		expiresAt: lucia.getNewSessionExpiration(),
		loginAt: new Date(),
		jwt: jwt
	};

	await redisClient.sessionRepository.save({
		id: session.id,
		user_id: session.userId,
		expires_at: session.expiresAt,
		login_at: session.loginAt,
		jwt: session.jwt
	});

	return session;
}

async function generateJWT(session_token: string, userId: string, expires: Date) {
	const payload = {
		session_token: session_token,
		user_id: userId
	};

	const secret = process.env.JWT_SECRET;
	if (!secret) {
		throw new Error('JWT_SECRET not set');
	}

	// convert secret to an array buffer
	const encoder = new TextEncoder();
	const secretArrayBuffer = encoder.encode(secret);

	const jwt = await createJWT('HS256', secretArrayBuffer, payload, {
		expiresIn: new TimeSpan(expires.getTime() - Date.now(), 'ms')
	});

	return jwt;
}
