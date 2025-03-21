import { databases, Query, ID } from './appwrite';
import type { Models } from 'appwrite';

// Constants for Appwrite resources
export const DATABASE_ID = '67dcf95e0002b92bb646';
export const USERS_COLLECTION_ID = '67dcf96c0012a1e2a1a7';
// Create this collection in Appwrite with the fields described in the comments below
export const MESSAGES_COLLECTION_ID = '67dd1d90003d0c2a46a5'; // Replace with your actual ID once created

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

// Message data type
export interface MessageData {
    $id: string;
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: string;
    read: boolean;
}

// Get all users from the database
export const getUsers = async (): Promise<UserData[]> => {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            USERS_COLLECTION_ID
        );

        return response.documents as unknown as UserData[];
    } catch (error) {
        console.error('Appwrite service error - getUsers:', error);
        throw error;
    }
};

// Get a specific user by ID
export const getUserById = async (userId: string): Promise<UserData> => {
    try {
        const response = await databases.getDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            userId
        );

        return response as unknown as UserData;
    } catch (error) {
        console.error('Appwrite service error - getUserById:', error);
        throw error;
    }
};

// Search users by name or email
export const searchUsers = async (searchTerm: string): Promise<UserData[]> => {
    try {
        // Use contains search on both name and email fields for better results
        const response = await databases.listDocuments(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            [
                Query.or([
                    Query.search('name', searchTerm),
                    Query.search('email', searchTerm)
                ])
            ]
        );

        return response.documents as unknown as UserData[];
    } catch (error) {
        console.error('Appwrite service error - searchUsers:', error);
        throw error;
    }
};

// Get messages between two users
export const getMessages = async (senderId: string, receiverId: string): Promise<MessageData[]> => {
    try {
        // Create the messages collection if it doesn't exist
        try {
            // Check if collection exists by trying to list documents
            await databases.listDocuments(DATABASE_ID, MESSAGES_COLLECTION_ID, [Query.limit(1)]);
        } catch (error) {
            console.error('Messages collection not found. Please create it in Appwrite.');
            throw new Error('Messages collection not found. Please create it in Appwrite with the following fields: senderId, receiverId, content, timestamp, read');
        }

        const response = await databases.listDocuments(
            DATABASE_ID,
            MESSAGES_COLLECTION_ID,
            [
                Query.or([
                    Query.and([
                        Query.equal('senderId', senderId),
                        Query.equal('receiverId', receiverId),
                    ]),
                    Query.and([
                        Query.equal('senderId', receiverId),
                        Query.equal('receiverId', senderId),
                    ]),
                ]),
                Query.orderAsc('timestamp'),
            ]
        );

        return response.documents as unknown as MessageData[];
    } catch (error) {
        console.error('Appwrite service error - getMessages:', error);
        throw error;
    }
};

// Send a new message
export const sendMessage = async (
    senderId: string,
    receiverId: string,
    content: string
): Promise<MessageData> => {
    try {
        const timestamp = new Date().toISOString();

        // Create the message document
        const response = await databases.createDocument(
            DATABASE_ID,
            MESSAGES_COLLECTION_ID,
            ID.unique(),
            {
                senderId,
                receiverId,
                content,
                timestamp,
                read: false,
            }
        );

        return response as unknown as MessageData;
    } catch (error) {
        // Check if the error is about collection not found
        if (error instanceof Error && error.toString().includes('Collection with the requested ID could not be found')) {
            console.error('Messages collection not found. Please create it in Appwrite.');
            throw new Error('Messages collection not found. Please create it in Appwrite with fields: senderId, receiverId, content, timestamp, read');
        }

        console.error('Appwrite service error - sendMessage:', error);
        throw error;
    }
};

// Mark a message as read
export const markMessageAsRead = async (messageId: string): Promise<MessageData> => {
    try {
        const response = await databases.updateDocument(
            DATABASE_ID,
            MESSAGES_COLLECTION_ID,
            messageId,
            {
                read: true
            }
        );

        return response as unknown as MessageData;
    } catch (error) {
        console.error('Appwrite service error - markMessageAsRead:', error);
        throw error;
    }
};

// Get the last message for each conversation
export const getLastMessages = async (userId: string): Promise<Record<string, MessageData>> => {
    try {
        // Get all messages involving this user
        const response = await databases.listDocuments(
            DATABASE_ID,
            MESSAGES_COLLECTION_ID,
            [
                Query.or([
                    Query.equal('senderId', userId),
                    Query.equal('receiverId', userId),
                ]),
                Query.orderDesc('timestamp'),
                Query.limit(100)
            ]
        );

        // Process to get last message for each conversation
        const messages = response.documents as unknown as MessageData[];
        const lastMessagesMap: Record<string, MessageData> = {};

        messages.forEach(message => {
            const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;

            if (!lastMessagesMap[otherUserId]) {
                lastMessagesMap[otherUserId] = message;
            }
        });

        return lastMessagesMap;
    } catch (error) {
        console.error('Appwrite service error - getLastMessages:', error);
        throw error;
    }
};