/**
 * server/services/socket.ts
 * 
 * WebSocket (Socket.IO) service for real-time communication.
 * Manages socket connections, room subscriptions (admins, individual users),
 * and emits events for new orders, user registrations, order status updates, and notifications.
 */

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
    console.log("[Socket] Emitting newOrder to admins");
    io.to("admins").emit("newOrder", order);
  }
}

export function emitNewUser(user: any) {
  if (io) {
    console.log("[Socket] Emitting newUser to admins");
    io.to("admins").emit("newUser", user);
  }
}

export function emitOrderStatusUpdate(userId: number, order: any) {
  if (io) {
    // Notify specific user
    io.to(`user_${userId}`).emit("orderStatusUpdate", order);
    // Notify admins
    io.to("admins").emit("orderStatusUpdate", order);
    console.log(`[Socket] Order status update emitted for user ${userId}`);
  }
}

export function emitPayoutUpdate() {
  if (io) {
    io.to("admins").emit("payoutUpdate");
    console.log("[Socket] Payout update emitted to admins");
  }
}

export function emitPaymentUpdate() {
  if (io) {
    io.to("admins").emit("paymentUpdate");
    console.log("[Socket] Payment update emitted to admins");
  }
}

export function emitUserUpdate() {
  if (io) {
    io.to("admins").emit("userUpdate");
    console.log("[Socket] User update emitted to admins");
  }
}

export function emitNotification(userId: number, notification: any) {
  if (io) {
    io.to(`user_${userId}`).emit("notification", notification);
    console.log(`[Socket] Notification emitted for user ${userId}`);
  }
}
