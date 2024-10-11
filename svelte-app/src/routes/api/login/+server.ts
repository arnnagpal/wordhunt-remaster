import { error, json, type RequestHandler } from '@sveltejs/kit';
import { verify } from '@node-rs/argon2';
import { createSession, mongoClient } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request }) => {
	const { username, password } = await request.json();

	if (!username || typeof username !== 'string') {
		return error(400, 'Invalid username');
	}

	if (!password || typeof password !== 'string') {
		return error(400, 'Invalid password');
	}

	const user = await mongoClient.User.findOne({ username }).exec();

	if (!user) {
		return error(400, 'Invalid username/email or password');
	}

	const validPassword = await verify(user.password_hash, password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});

	if (!validPassword) {
		return error(400, 'Invalid username/email or password');
	}

	const session = await createSession(user._id);

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
