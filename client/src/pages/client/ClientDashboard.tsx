import DashboardLayout from "@/components/layouts/DashboardLayout";
import StatusBadge from "@/components/common/StatusBadge";
import { Wallet, ClipboardList, DollarSign, Crown, Plus, Headphones, Clock, Settings, CheckCircle } from "lucide-react";
import { Link, useLoaderData, useRevalidator } from "react-router-dom";
import { apiClient } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useSocket } from "@/hooks/useSocket";
import { useEffect } from "react";
import { toast } from "sonner";

const ClientDashboard = () => {
  const { dashboard } = useLoaderData() as { dashboard: any };
  const { revalidate } = useRevalidator();
  const { user } = useAuth();
  const { t, i18n } = useTranslation(["client", "common"]);
  const { on, off } = useSocket();

  useEffect(() => {
    const handleStatusUpdate = (order: any) => {
      console.log("[ClientDashboard] Order status updated via socket:", order);
      
      // Play subtle notification sound if desired
      // For now just toast and refresh
      
      toast.success(t("dashboard.notifications.statusUpdate", { defaultValue: "Order Updated!" }), {
        description: `${t("dashboard.recentOrders.service", { defaultValue: "Service" })}: ${order.serviceName || order.serviceId} - ${t(`common:status.${order.status}`, { defaultValue: order.status })}`,
        duration: 5000,
      });

      // Refresh data
      revalidate();
    };

    on("STATUS_UPDATE", handleStatusUpdate);

    return () => {
      off("STATUS_UPDATE");
    };
  }, [on, off, revalidate, t]);

  const quickActionsList = [
    { icon: Clock, label: t("dashboard.quickActions.orderHistory"), href: "/client/orders" },
    { icon: Headphones, label: t("dashboard.quickActions.support"), href: "/client/support" },
    { icon: Settings, label: t("dashboard.quickActions.settings"), href: "/client/profile" },
  ];

  const stats: {
      label: string;
      value: string | number;
      icon: any;
      color?: string;
      bgKey?: string;
      badge?: string;
      badgeIcon?: any;
      change?: string;
      note?: string;
  }[] = [
    {
      label: t("dashboard.stats.spent"),
      value: formatPrice(dashboard?.totalSpent || 0),
      icon: DollarSign,
      color: "text-green-500",
      bgKey: "bg-green-500/10",
      badge: user?.isVip ? t("dashboard.stats.vipLevel") : undefined,
      badgeIcon: user?.isVip ? Crown : undefined,
    },
    {
      label: t("dashboard.stats.completedOrders"),
      value: dashboard?.completedOrders,
      icon: CheckCircle,
      color: "text-blue-500",
      bgKey: "bg-blue-500/10",
    },
    {
      label: t("dashboard.stats.activeOrders"),
      value: dashboard?.activeOrders,
      icon: Clock,
      color: "text-orange-500",
      bgKey: "bg-orange-500/10",
    },
  ];

  return (
    <DashboardLayout>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {t("dashboard.welcome", { name: user?.name })}
        </h1>
        <p className="text-muted-foreground">
          {t("dashboard.description")}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-card rounded-xl p-5 border border-border card-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                index === 0 ? "bg-success/10" : 
                index === 1 ? "bg-primary/10" : 
                index === 2 ? "bg-warning/10" : "bg-info/10"
              }`}>
                <stat.icon className={`w-6 h-6 ${
                  index === 0 ? "text-success" : 
                  index === 1 ? "text-primary" : 
                  index === 2 ? "text-warning" : "text-info"
                }`} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            {stat.change && (
              <p className={`text-xs mt-1 ${stat.color || "text-muted-foreground"}`}>{stat.change}</p>
            )}
            {stat.note && (
              <p className={`text-xs mt-1 ${stat.color || "text-muted-foreground"}`}>{stat.note}</p>
            )}
            {stat.badge && (
              <p className="text-xs mt-2 flex items-center gap-1 text-warning">
                {stat.badgeIcon && <stat.badgeIcon className="w-4 h-4" />}
                {stat.badge}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border card-shadow">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="text-lg font-bold text-foreground">{t("dashboard.recentOrders.title")}</h2>
            <Link to="/client/orders" className="text-sm text-primary hover:underline">
              {t("dashboard.recentOrders.viewAll")}
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-start text-xs font-medium text-muted-foreground p-4">{t("dashboard.recentOrders.orderId")}</th>
                  <th className="text-start text-xs font-medium text-muted-foreground p-4">{t("dashboard.recentOrders.service")}</th>
                  <th className="text-start text-xs font-medium text-muted-foreground p-4">{t("dashboard.recentOrders.price")}</th>
                  <th className="text-start text-xs font-medium text-muted-foreground p-4">{t("dashboard.recentOrders.status")}</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recentOrders.length === 0 ? (
                    <tr>
                        <td colSpan={4} className="p-8 text-center text-muted-foreground">
                            {t("dashboard.recentOrders.noOrders")}
                        </td>
                    </tr>
                ) : (
                    dashboard.recentOrders.map((order: any) => (
                    <tr key={order.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                        <td className="p-4 text-sm text-foreground font-medium">#{order.id}</td>
                        <td className="p-4">
                            <span className="text-sm text-foreground">{order.serviceName}</span>
                        </td>
                        <td className="p-4 text-sm text-foreground">{formatPrice(order.totalAmount)}</td>
                        <td className="p-4">
                        <StatusBadge status={order.status} />
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Promo Banner */}
        <div className="bg-gradient-to-inline-end from-primary to-primary/80 rounded-xl p-6 text-primary-foreground h-fit">
            <h3 className="text-xl font-bold mb-1 text-foreground">
                {t("dashboard.promo.title")}
            </h3>
            <p className="text-muted-foreground mb-4">
                {t("dashboard.promo.description")}
            </p>
            <Link
                to="/services"
                className="bg-card text-foreground px-6 py-3 rounded-lg font-medium border border-border hover:bg-secondary/50 transition-colors inline-block text-center w-full">
              {t("dashboard.promo.browse")}
            </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;
