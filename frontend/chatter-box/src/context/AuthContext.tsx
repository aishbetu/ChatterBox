import { createContext, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
    token: string | null;
    login: (token: string, user_id: string) => void;
    logout: () => void;
    userId: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    // Initialize state from localStorage on first render:
    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem('chatterBoxToken');
    });
     const [userId, setUserId] = useState<string | null>(() => {
        return localStorage.getItem('userId');
    });
    const navigate = useNavigate();

    const login = (newToken: string, user_id: string) => {
        localStorage.setItem('chatterBoxToken', newToken);
        localStorage.setItem('userId', user_id);
        setToken(newToken);
        setUserId(userId);
        navigate('/chat', { replace: true });
    }

    const logout = () => {
        localStorage.removeItem('chatterBoxToken');
        setToken(null);
        navigate('/login');
    }

    return (
        <AuthContext.Provider value={{ token, login, logout, userId }}>
            {children}
        </AuthContext.Provider>
    )
}