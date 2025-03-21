import { Client, Account, Databases } from 'appwrite';

export const client = new Client();

client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('67dcf04a000a7ab2b868'); // Your project ID

export const account = new Account(client);
export const databases = new Databases(client);
export { ID, Query } from 'appwrite';
// Fix for verbatimModuleSyntax - use 'export type' for type exports
export type { Models } from 'appwrite';