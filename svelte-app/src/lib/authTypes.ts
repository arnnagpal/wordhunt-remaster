import type { LuciaSession } from 'lucia';

export interface User {
	id: string;
	email: string;
	username: string;
	display_name: string;
	rating: number;
	games: string[];
}

export interface Session extends LuciaSession {
	userId: string;
	loginAt: Date;
	jwt: string;
}
