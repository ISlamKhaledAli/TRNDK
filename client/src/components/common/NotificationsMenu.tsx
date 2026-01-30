import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationsContext";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { enUS } from "date-fns/locale";

const NotificationsMenu = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { user } = useAuth();
  const { t, i18n } = useTranslation("common");
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        if (isOpen && unreadCount > 0) {
           markAllAsRead();
        }
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, unreadCount, markAllAsRead]);

  const handleToggle = () => {
    if (isOpen && unreadCount > 0) {
      markAllAsRead();
    }
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = async (id: number, isRead: boolean) => {
    if (!isRead) {
      await markAsRead(id);
    }
    if (unreadCount > 0) {
      markAllAsRead();
    }
    setIsOpen(false);
  };

  const getTargetLink = (notification: any) => {
    if (notification.orderId) {
      return user?.role === 'admin' ? '/admin/orders' : '/client/orders';
    }
    return "#";
  };

  const getLocalizedContent = (title: string, message: string) => {
    let localizedTitle = title;
    let localizedMessage = message;

    // Try to translate title if it's a key
    if (title.startsWith('notifications.')) {
      localizedTitle = t(title);
    }

    // Try to parse message as JSON
    try {
      const parsedMessage = JSON.parse(message);
      if (parsedMessage && parsedMessage.key) {
        // Evaluate params if they exist (e.g. status labels)
        const params = { ...parsedMessage.params };
        if (params.status && params.status.startsWith('statusLabels.')) {
          params.status = t(params.status) as string;
        }
        localizedMessage = t(parsedMessage.key, params) as string;
      }
    } catch (e) {
      // Not JSON, treat as plain text (legacy support)
    }

    return { title: localizedTitle, message: localizedMessage };
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-lg hover:bg-accent transition-colors"
        title={t("notifications.title")}
      >
        <Bell className="w-5 h-5 text-red-500 hover:text-red-600 transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -end-1.5 min-w-[1.25rem] h-5 flex items-center justify-center bg-red-500 text-white text-[11px] font-bold rounded-full px-1 ring-2 ring-card shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
          className="absolute end-0 mt-2 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in zoom-in duration-200"
        >
          <div className="p-4 border-b border-border bg-muted/30 text-start">
            <h3 className="font-semibold">{t("notifications.title")}</h3>
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>{t("notifications.noNotifications")}</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notification) => {
                  const { title, message } = getLocalizedContent(notification.title, notification.message);
                  return (
                    <Link
                      key={notification.id}
                      to={getTargetLink(notification)}
                      onClick={() => handleNotificationClick(notification.id, notification.isRead)}
                      className={cn(
                        "block p-4 hover:bg-accent/50 transition-colors text-start",
                        !notification.isRead && "bg-primary/5"
                      )}
                    >
                      <div className="flex gap-3 items-start">
                        <div className={cn(
                          "w-2 h-2 mt-1.5 rounded-full shrink-0",
                          !notification.isRead ? "bg-primary" : "bg-transparent"
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm font-medium mb-1 truncate", !notification.isRead && "text-primary")}>
                            {title}
                          </p>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2 leading-relaxed">
                            {message}
                          </p>
                          <span className="text-[11px] text-muted-foreground/70 font-medium">
                            {format(new Date(notification.createdAt), "d MMMM p", { locale: i18n.language === 'ar' ? ar : enUS })}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsMenu;
