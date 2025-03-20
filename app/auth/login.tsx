import { SignIn } from "@clerk/react-router";
import { Navigate } from "react-router";
import { useAuth } from "@clerk/react-router";

export default function Login() {
    const { isSignedIn, isLoaded } = useAuth();

    // If user is already signed in, redirect to dashboard
    if (isLoaded && isSignedIn) {
        return <Navigate to="/chat" replace />;
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md">
                <SignIn routing="path" path="/" signUpUrl="/signup" />
            </div>
        </div>
    );
}