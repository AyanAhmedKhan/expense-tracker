import React, { createContext, useContext, useState, useEffect } from 'react';
import client from './api/client';

interface User {
    id: number;
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetchUser();
            // Set initial activity if not present
            if (!localStorage.getItem('lastActivity')) {
                localStorage.setItem('lastActivity', Date.now().toString());
            }
        } else {
            setLoading(false);
        }
    }, [token]);

    // Session Timeout Logic
    useEffect(() => {
        if (!token) return;

        const updateActivity = () => {
            localStorage.setItem('lastActivity', Date.now().toString());
        };

        const checkActivity = () => {
            const lastActivity = localStorage.getItem('lastActivity');
            if (lastActivity) {
                const now = Date.now();
                const thirtyMinutes = 30 * 60 * 1000;
                if (now - Number(lastActivity) > thirtyMinutes) {
                    console.log('Session timed out due to inactivity');
                    logout();
                }
            }
        };

        // Listen for user activity
        const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
        events.forEach(event => window.addEventListener(event, updateActivity));

        // Check every minute
        const interval = setInterval(checkActivity, 60000);

        return () => {
            events.forEach(event => window.removeEventListener(event, updateActivity));
            clearInterval(interval);
        };
    }, [token]);

    const fetchUser = async () => {
        try {
            const response = await client.get<User>('/auth/me');
            setUser(response.data);
        } catch (error) {
            console.error('Failed to fetch user', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (newToken: string) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('lastActivity', Date.now().toString());
        setToken(newToken);
        await fetchUser();
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('lastActivity');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
