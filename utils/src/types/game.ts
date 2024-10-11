import { GamePlayer, LiveGamePlayer } from "./game-player";

export interface Game {
    _id: string;
    session_type: number;
    players: GamePlayer[];
    winner: string;
    board: string;
    timer: number;
    created_at: number;
    ended_at: number;
    single_player: boolean;
}

export interface ActiveGame {
    _id: string;
    session_type: number;
    players: LiveGamePlayer[];
    board: string;
    timer: number;
    created_at: number;
    single_player: boolean;
}

export enum GamePreset {
    Classic = 90,
    Unlimited = -1,
}
