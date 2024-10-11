export interface Session {
    id: string;
    user_id: string;
    expires_at: Date;
}

export enum SessionType {
    Active,
    Finished,
}
