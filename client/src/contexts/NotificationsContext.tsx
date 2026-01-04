import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from "@/services/api";
import { useAuth } from './AuthContext';
import { toast } from "sonner";
import { useSocket } from '@/hooks/useSocket';
import { useTranslation } from 'react-i18next';

export interface Notification {
  id: number;
  userId: number;
  orderId?: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { on, off } = useSocket();
  const { t } = useTranslation("common");

  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await apiClient.getNotifications();
      // Ensure we're setting an array
      const data = Array.isArray(response.data) ? response.data : [];
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const handleNewNotification = (notification: Notification) => {
      console.log("[NotificationsContext] New notification received:", notification);
      setNotifications(prev => [notification, ...prev]);
    };

    on("NEW_NOTIFICATION", handleNewNotification);

    return () => {
      off("NEW_NOTIFICATION");
    };
  }, [user, on, off]);

  const markAsRead = async (id: number) => {
    try {
      await apiClient.markNotificationRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      toast.error("Failed to update notification");
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      toast.error("Failed to update notifications");
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationsContext.Provider value={{ 
      notifications, 
      unreadCount, 
      isLoading, 
      markAsRead,
      markAllAsRead,
      refreshNotifications: fetchNotifications 
    }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return context;
}
