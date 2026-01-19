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
  const [socket, setSocket] = React.useState<Socket | null>(null);

  useEffect(() => {
    if (!user) {
      if (socket) {
        console.log("[SocketContext] Disconnecting socket due to logout");
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    if (!socket) {
      console.log("[SocketContext] Initializing socket connection");
      const newSocket = io({
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
        autoConnect: true
      });

      newSocket.on("connect", () => {
        console.log("[SocketContext] Connected to server");
        if (user.id) newSocket.emit("join_user", user.id);
        if (user.role === "admin") newSocket.emit("join_admins", user);
      });

      // Handle reconnection logic specifically to re-join rooms
      newSocket.on("reconnect", () => {
        console.log("[SocketContext] Reconnected to server");
        if (user.id) newSocket.emit("join_user", user.id);
        if (user.role === "admin") newSocket.emit("join_admins", user);
      });

      newSocket.on("disconnect", (reason) => {
        console.log("[SocketContext] Disconnected from server:", reason);
      });

      newSocket.on("connect_error", (error) => {
        console.error("[SocketContext] Connection error:", error);
      });

      setSocket(newSocket);
    }

    return () => {
      // Keep alive unless user changes or unmounts completely
    };
  }, [user, socket]);

  const on = React.useCallback((event: string, callback: (data: any) => void) => {
    if (socket) {
      console.log(`[SocketContext] Attaching listener for: ${event}`);
      socket.on(event, callback);
    }
  }, [socket]);

  const off = React.useCallback((event: string, callback?: (data: any) => void) => {
    if (socket) {
      console.log(`[SocketContext] Removing listener for: ${event}`);
      if (callback) {
        socket.off(event, callback);
      } else {
        socket.off(event);
      }
    }
  }, [socket]);

  const emit = React.useCallback((event: string, data: any) => {
    if (socket) {
      socket.emit(event, data);
    }
  }, [socket]);

  const contextValue = React.useMemo(() => ({ socket, on, off, emit }), [socket, on, off, emit]);

  return (
    <SocketContext.Provider value={contextValue}>
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
