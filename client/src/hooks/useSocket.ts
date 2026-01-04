import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/contexts/AuthContext";

export const useSocket = () => {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user) return;

    // Connect to the same host as the window
    const socket = io();
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[Socket] Connected to server");
      
      // All authenticated users join their own room
      if (user && user.id) {
        socket.emit("join_user", user.id);
      }

      // If admin, join the admins room
      if (user.role === "admin") {
        socket.emit("join_admins", user);
      }
    });

    socket.on("disconnect", () => {
      console.log("[Socket] Disconnected from server");
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user]);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  }, []);

  const off = useCallback((event: string) => {
    if (socketRef.current) {
      socketRef.current.off(event);
    }
  }, []);

  return { on, off, socket: socketRef.current };
};
