import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { account, databases, ID } from '~/lib/appwrite';
import { OAuthProvider } from 'appwrite';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';
import { Github } from 'lucide-react';


// Simple login page with direct document creation
const LoginPage = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Handle GitHub login button click
    const handleGitHubLogin = () => {
        console.log('Starting GitHub login...');
        setLoading(true);
        setError(null);

        try {
            // Get the URLs
            const baseUrl = window.location.origin;
            const successUrl = `${baseUrl}/create-user`; // Redirect to a page that handles user creation
            const failureUrl = `${baseUrl}/`;

            console.log(`Success URL: ${successUrl}`);
            console.log(`Failure URL: ${failureUrl}`);

            // Start OAuth login flow
            account.createOAuth2Session(
                OAuthProvider.Github,
                successUrl,
                failureUrl
            );
        } catch (error) {
            console.error('GitHub login error:', error);
            setLoading(false);
            setError('Failed to start login process. Please try again.');
        }
    };

    // Check for error in URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('error') === 'failed') {
            setError('Authentication failed. Please try again.');
        }
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Welcome</CardTitle>
                    <CardDescription className="text-center">
                        Sign in to your account
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {error && (
                        <div className="p-3 mb-4 text-sm text-red-800 bg-red-100 rounded-md">
                            {error}
                        </div>
                    )}

                    <Button
                        className="w-full bg-black hover:bg-gray-800 text-white"
                        onClick={handleGitHubLogin}
                        disabled={loading}
                    >
                        <Github className="mr-2 h-4 w-4" />
                        {loading ? 'Connecting...' : 'Continue with GitHub'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default LoginPage;