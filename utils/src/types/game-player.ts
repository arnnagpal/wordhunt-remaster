export interface GamePlayer {
    username: string;
    id: string;
    words: string[];
    score: number;
}

export interface LiveGamePlayer extends GamePlayer {
    game_id: string;
    letters_selected: string[];
    time_left: number;
}
