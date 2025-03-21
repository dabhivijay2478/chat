import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router";
import { account } from "~/lib/appwrite";

export default function ProtectedLayout() {
    const [authState, setAuthState] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Try to get the current session from Appwrite
                await account.get();
                setAuthState("authenticated");
            } catch (error) {
                console.error("Authentication failed:", error);
                setAuthState("unauthenticated");
            }
        };

        checkAuth();
    }, []);

    // Show loading state while checking authentication
    if (authState === "loading") {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    // Redirect to signin if not authenticated
    if (authState === "unauthenticated") {
        return <Navigate to="/" replace />;
    }

    // Render the protected content
    return <Outlet />;
}