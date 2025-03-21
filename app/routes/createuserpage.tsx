import { useEffect, useState } from 'react';
import { account, databases, ID } from '~/lib/appwrite';
import { DATABASE_ID, USERS_COLLECTION_ID } from '~/types/appwrite';
import { useNavigate } from 'react-router';

// This is a special page that just handles user creation and redirects
const CreateUserPage = () => {
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const createUserDocument = async () => {
            try {
                // 1. Get the current user
                console.log('Fetching current user...');
                const user = await account.get();
                console.log('Current user:', user);

                if (!user || !user.$id) {
                    throw new Error('No user found');
                }

                // 2. Create a document for this user
                console.log('Creating user document...');
                const currentTime = new Date().toISOString();

                const userData = {
                    userId: user.$id,
                    name: user.name || '',
                    email: user.email || '',
                    provider: 'github',
                    registrationDate: currentTime,
                    lastLogin: currentTime,
                    avatarUrl: user.prefs?.avatar || '',
                };

                console.log('User data to create:', userData);
                console.log('DATABASE_ID:', DATABASE_ID);
                console.log('USERS_COLLECTION_ID:', USERS_COLLECTION_ID);

                // Create document with explicit try/catch
                try {
                    const docId = ID.unique();
                    console.log('Generated document ID:', docId);

                    const result = await databases.createDocument(
                        DATABASE_ID,
                        USERS_COLLECTION_ID,
                        docId,
                        userData
                    );

                    console.log('Document created successfully:', result);

                    // 3. Redirect to chat page
                    navigate('/chat');
                } catch (dbError) {
                    console.error('Database error details:', dbError);
                    if (dbError) {
                        console.error('Server response:', JSON.stringify(dbError));
                    }
                    throw dbError;
                }
            } catch (error) {
                console.error('Error creating user:', error);
                setError('Failed to create user. Please try again.');
                setTimeout(() => {
                    navigate('/');
                }, 3000);
            }
        };

        createUserDocument();
    }, [navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
                {error ? (
                    <div className="text-red-600">
                        {error}
                        <div className="mt-2">Redirecting to login page...</div>
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                        <p>Setting up your account...</p>
                        <p className="text-sm text-gray-500 mt-2">Please wait, you'll be redirected automatically.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateUserPage;