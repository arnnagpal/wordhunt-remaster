export interface MongoMessage {
    _id: string;
    user_id: string;
    username: string;
    message: string;
    created_at: number;
}

export interface Message {
    username: string;
    message: string;
    created_at: number;
    avg_score: number;
}
