import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { User } from "@shared/schema";

let io: Server | null = null;

export function setupSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: "*", // Adjust as needed for production
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    // We can potentially extract user from handshake cookie here if needed
    // For now, let's allow joining an "admins" room explicitly or via check
    
    socket.on("join_admins", (user: User) => {
      if (user && user.role === "admin") {
        socket.join("admins");
        console.log(`[Socket] Admin joined room: ${user.email}`);
      }
    });

    socket.on("join_user", (userId: number) => {
      if (userId) {
        const room = `user_${userId}`;
        socket.join(room);
        console.log(`[Socket] User joined room: ${room}`);
      }
    });

    socket.on("disconnect", () => {
      // Handle cleanup if necessary
    });
  });

  return io;
}

export function emitNewOrder(order: any) {
  if (io) {
    console.log("[Socket] Emitting NEW_ORDER to admins");
    io.to("admins").emit("NEW_ORDER", order);
  }
}

export function emitNewUser(user: any) {
  if (io) {
    console.log("[Socket] Emitting NEW_USER to admins");
    io.to("admins").emit("NEW_USER", user);
  }
}

export function emitOrderStatusUpdate(userId: number, order: any) {
  if (io) {
    const room = `user_${userId}`;
    console.log(`[Socket] Emitting STATUS_UPDATE to room: ${room}`);
    io.to(room).emit("STATUS_UPDATE", order);
  }
}

export function emitNotification(userId: number, notification: any) {
  if (io) {
    const room = `user_${userId}`;
    console.log(`[Socket] Emitting NEW_NOTIFICATION to room: ${room}`);
    io.to(room).emit("NEW_NOTIFICATION", notification);
  }
}
