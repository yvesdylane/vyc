export interface User {
    id: string; // UUID
    name: string;
    sur_name: string;
    email: string;
    tell?: number; // optional
    user_name: string;
    password: string; // hashed
    bio?: string;
    dob?: string; // ISO date string, e.g., "1990-01-01"
    region?: string;
    is_verified: boolean;
    token?: string;
    token_expire_at?: string; // ISO timestamp string
    created_at: string; // ISO timestamp string
}
