import { useAuth } from "@clerk/clerk-react";
import { Navigate, Outlet } from "react-router";

export default function ProtectedLayout() {
    const { isSignedIn, isLoaded } = useAuth();

    // Show loading state while Clerk is initializing
    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    // Redirect to signin if not authenticated
    if (!isSignedIn) {
        return <Navigate to="/" replace />;
    }

    // Render the protected content
    return <Outlet />;
}