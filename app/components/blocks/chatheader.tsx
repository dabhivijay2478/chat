import { useEffect, useState } from 'react';
import { account } from '~/lib/appwrite';
import { UserCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '~/components/ui/dropdown-menu';

// Define a proper type for the user
interface User {
    $id: string;
    email: string;
    name?: string;
    preferences?: {
        avatar?: string;
    };
}

const ChatHeader = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch user data when component mounts
        const fetchUserData = async () => {
            try {
                const userData = await account.get() as User;
                console.log('User data fetched:', userData);
                setUser(userData);
            } catch (error) {
                console.error('Failed to fetch user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleLogout = async () => {
        try {
            await account.deleteSession('current');
            navigate('/');
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    };

    return (
        <div className="flex items-center justify-between p-4 border-b">
            <h1 className="text-xl font-bold">Chats</h1>
            <div className='ml-20'>
                {loading ? (
                    <div className="text-sm text-gray-500">Loading...</div>
                ) : user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
                            <div className="flex items-center gap-2">
                                {user.preferences?.avatar ? (
                                    <img
                                        src={user.preferences.avatar}
                                        alt="User avatar"
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                ) : (
                                    <UserCircle className="w-8 h-8 text-gray-500" />
                                )}
                                <span className="text-sm font-medium">
                                    {user.name || user.email || 'GitHub User'}
                                </span>
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <div className="px-2 py-1.5 text-sm font-semibold">
                                {user.name || user.email || 'GitHub User'}
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="flex items-center gap-2 cursor-pointer text-red-500 hover:text-red-600"
                                onClick={handleLogout}
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : null}
            </div>
        </div>
    );
};

export default ChatHeader;