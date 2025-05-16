import { createContext, useContext, useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { AuthContext } from "./AuthContext";

interface SocketContextType {
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const { token } = useContext(AuthContext)!;
    const [socket, setSocket] = useState<Socket | null>(null);
    
    useEffect(() => {
        if(!token) return;

        // initialize socket with auth token
        const sock = io('http://localhost:3000', {
            auth: { token }
        });

        //Connection handlers
        sock.on('connect', () => {
            console.log('Socket connected:', sock.id);
        });
        sock.on('connect_error', (err) => {
            console.error('Socket connection error:', err);
        });

        setSocket(sock);

        return () => {
            sock.disconnect();
        }
    }, [token]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
  return useContext(SocketContext).socket;
}