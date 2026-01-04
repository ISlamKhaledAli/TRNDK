import { storage } from "./storage";
import { type Order } from "@shared/schema";
import { emitOrderStatusUpdate, emitNotification } from "./socket";

export class NotificationService {
  /**
   * Triggers a notification when a new order is created.
   */
  static async notifyOrderCreated(order: Order): Promise<void> {
    const title = "notifications.orderCreatedTitle";
    const message = JSON.stringify({
      key: "notifications.orderCreatedMessage",
      params: { orderId: order.id }
    });

    // Notify User
    const userNotif = await storage.createNotification({
      userId: order.userId,
      orderId: order.id,
      title,
      message,
    });
    if (userNotif.success) emitNotification(order.userId, userNotif.data);

    // Notify Admins
    const admins = await storage.getAdmins();
    const adminTitle = "notifications.newOrderAdminTitle";
    const adminMessage = JSON.stringify({
      key: "notifications.newOrderAdminMessage",
      params: { 
        orderId: order.id, 
        amount: `$${(order.totalAmount / 100).toFixed(2)}` 
      }
    });

    for (const admin of admins) {
      const adminNotif = await storage.createNotification({
        userId: admin.id,
        orderId: order.id,
        title: adminTitle,
        message: adminMessage,
      });
      if (adminNotif.success) emitNotification(admin.id, adminNotif.data);
    }
  }

  /**
   * Checks if the order status has changed and triggers a notification if so.
   */
  static async notifyOrderStatusChange(
    order: Order,
    newStatus: string,
    excludeUserId?: number
  ): Promise<void> {
    if (order.status === newStatus) {
      return;
    }

    // Don't notify the user if they caused the change (e.g. Admin updating their own test order)
    if (excludeUserId && order.userId === excludeUserId) {
      return;
    }

    const title = "notifications.orderStatusTitle";
    // We pass the raw status key, frontend will translate "statusLabels.pending", etc.
    // However, the status here is just "pending", "confirmed".
    const message = JSON.stringify({
      key: "notifications.orderStatusMessage",
      params: { 
        orderId: order.id, 
        status: `statusLabels.${newStatus}` // Pass a key prefix so frontend can translate
      }
    });

    const statusNotif = await storage.createNotification({
      userId: order.userId,
      orderId: order.id,
      title,
      message,
    });

    if (statusNotif.success) emitNotification(order.userId, statusNotif.data);

    // Real-time Socket.IO notification to user
    emitOrderStatusUpdate(order.userId, { ...order, status: newStatus });
  }
}
