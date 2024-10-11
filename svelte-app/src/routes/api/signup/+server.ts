import { error, json, type RequestHandler } from '@sveltejs/kit';
import { hash } from '@node-rs/argon2';
import { generateIdFromEntropySize } from 'lucia';
import { createSession } from '$lib/server/auth';
import { mongoClient } from '$lib/server/auth';
import { UserRole } from 'wordhunt-utils';

export const POST: RequestHandler = async ({ request }) => {
	const { email, username, displayName, password } = await request.json();

	if (!email || typeof email !== 'string') {
		return error(400, 'Invalid email');
	}

	if (!username || typeof username !== 'string') {
		return error(400, 'Invalid username');
	}

	if (!displayName || typeof displayName !== 'string') {
		return error(400, 'Invalid display name');
	}

	if (!password || typeof password !== 'string') {
		return error(400, 'Invalid password');
	}

	const passwordHash = await hash(password, {
		// recommended minimum parameters
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});
	const userId = generateIdFromEntropySize(10); // 16 characters long

	// check if user with email or username already exists
	// if it does, return error
	// otherwise, create user

	const user = await mongoClient.User.findOne({ $or: [{ email }, { username }] }).exec();
	if (user) {
		return error(400, 'User already exists');
	}

	const newUser = new mongoClient.User({
		_id: userId,
		email: email,
		username: username,
		display_name: displayName,
		password_hash: passwordHash,

		rating: 1500,
		rating_deviation: 200,
		rating_volatility: 0.06,

		games: [],
		role: UserRole.User
	});

	await newUser.save();

	const session = await createSession(userId);

	return json(
		{
			session_id: session.id,
			expires_at: session.expiresAt
		},
		{
			status: 202
		}
	);
};
