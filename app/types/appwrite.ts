import type { Models } from 'appwrite';

// Constants for Appwrite resources
export const DATABASE_ID = '67dcf95e0002b92bb646';
export const USERS_COLLECTION_ID = '67dcf96c0012a1e2a1a7';

// Type for user data stored in Appwrite
export interface UserData {
    userId: string;
    email?: string;
    name?: string;
    registrationDate: string;
    lastLogin: string;
    provider: string;
}

// User with additional fields we might need
export type AppwriteUser = Models.User<Models.Preferences>;