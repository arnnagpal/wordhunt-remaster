import { UserRole } from "./user-role";

export interface User {
    _id: string;
    email: string;
    username: string;
    display_name: string;
    password_hash: string;

    best_game?: {
        game_id: string;
        score: number;
    };

    rating: number;
    rating_deviation: number;
    rating_volatility: number;

    games: string[];
    role: UserRole;
}
