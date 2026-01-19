import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback?: (data: any) => void) => void;
  emit: (event: string, data: any) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        console.log("[SocketContext] Disconnecting socket due to logout");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    if (!socketRef.current) {
      console.log("[SocketContext] Initializing socket connection");
      socketRef.current = io({
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current.on("connect", () => {
        console.log("[SocketContext] Connected to server");
        
        if (user.id) {
          socketRef.current?.emit("join_user", user.id);
        }

        if (user.role === "admin") {
          socketRef.current?.emit("join_admins", user);
        }
      });

      socketRef.current.on("disconnect", (reason) => {
        console.log("[SocketContext] Disconnected from server:", reason);
      });

      socketRef.current.on("connect_error", (error) => {
        console.error("[SocketContext] Connection error:", error);
      });
    }

    return () => {
      // We don't necessarily want to disconnect on every re-render, 
      // but if the provider unmounts or user changes, we might.
      // The current logic handles user change via the dependency array.
    };
  }, [user]);

  const on = (event: string, callback: (data: any) => void) => {
    socketRef.current?.on(event, callback);
  };

  const off = (event: string, callback?: (data: any) => void) => {
    if (callback) {
      socketRef.current?.off(event, callback);
    } else {
      socketRef.current?.off(event);
    }
  };

  const emit = (event: string, data: any) => {
    socketRef.current?.emit(event, data);
  };

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, on, off, emit }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};
