/**
 * client/src/pages/admin/AdminDashboard.tsx
 * 
 * Admin dashboard page.
 * Displays key metrics (revenue, orders, users), statistics charts,
 * recent orders, recent users, and top services with real-time data.
 */

import AdminLayout from "@/components/layouts/AdminLayout";
import { Users, ShoppingCart, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, ClipboardList } from "lucide-react";
import { Link, useLoaderData, useRevalidator } from "react-router-dom";
import StatusBadge from "@/components/common/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "../../lib/utils";
import { useTranslation } from "react-i18next";
import { useSocket } from "@/hooks/useSocket";
import { useEffect } from "react";
import { toast } from "sonner";

const AdminDashboard = () => {
    const { dashboard } = useLoaderData() as { dashboard: any };
    const { revalidate } = useRevalidator();
    const { user } = useAuth();
    const { t } = useTranslation("admin");
    const { on, off } = useSocket();

    useEffect(() => {
        const handleNewOrder = (order: any) => {
            console.log("[AdminDashboard] New order received via socket:", order);
            
            // Play notification sound
            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
            audio.play().catch(err => console.error("Error playing sound:", err));

            // Show visual notification
            toast.success(t("dashboard.notifications.newOrder", { defaultValue: "New Order Received!" }), {
                description: `${t("dashboard.recentOrders.service", { defaultValue: "Service" })}: ${order.serviceId} - ${formatPrice(order.totalAmount)}`,
                duration: 5000,
            });

            // Refresh dashboard data instantly
            revalidate();
        };

        on("newOrder", handleNewOrder);

        const handleNewUser = (user: any) => {
            console.log("[AdminDashboard] New user registered via socket:", user);
            
            // Show visual notification
            toast.info(t("dashboard.notifications.newUser", { defaultValue: "New User Registered!" }), {
                description: `${user.name} (${user.email})`,
                duration: 5000,
            });

            // Refresh dashboard data instantly
            revalidate();
        };

        on("newUser", handleNewUser);

        return () => {
            off("newOrder", handleNewOrder);
            off("newUser", handleNewUser);
        };
    }, [on, off, revalidate, t]);
    
    if (!dashboard) return null;

  const formatChange = (val: number) => {
    const sign = val >= 0 ? "+" : "";
    return `${sign}${val.toFixed(1)}%`;
  };

  const stats = [
    {
        label: t("dashboard.stats.totalRevenue"),
        value: formatPrice(dashboard?.totalRevenue || 0),
        change: formatChange(dashboard.revenueChange || 0),
        up: (dashboard.revenueChange || 0) >= 0,
        icon: DollarSign,
        color: "text-green-500",
        bgKey: "bg-green-500/10",
    },
    { 
        label: t("dashboard.stats.totalOrders"),
        value: dashboard.totalOrders.toString(),
        change: formatChange(dashboard.ordersChange || 0),
        up: (dashboard.ordersChange || 0) >= 0,
        icon: ShoppingCart,
        color: "text-blue-500",
        bgKey: "bg-blue-500/10",
    },
    {
        label: t("dashboard.stats.totalUsers"), 
        value: dashboard.totalUsers.toString(), 
        change: formatChange(dashboard.usersChange || 0), 
        up: (dashboard.usersChange || 0) >= 0,
        icon: Users,
        color: "text-purple-500",
        bgKey: "bg-purple-500/10",
    },
    {
        label: t("dashboard.stats.conversionRate"), 
        value: `${(dashboard.conversionRate || 0).toFixed(1)}%`, 
        change: formatChange(dashboard.conversionRateChange || 0), 
        up: (dashboard.conversionRateChange || 0) >= 0,
        icon: TrendingUp, 
        color: "text-orange-500",
        bgKey: "bg-orange-500/10",
    },
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">{t("dashboard.title")}</h1>
        <p className="text-muted-foreground">{t("dashboard.welcome", { name: user?.name || "Admin" })}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-card rounded-xl p-5 border border-border card-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                index === 0 ? "bg-success/10" : 
                index === 1 ? "bg-primary/10" : 
                index === 2 ? "bg-info/10" : "bg-warning/10"
              }`}>
                <stat.icon className={`w-6 h-6 ${
                  index === 0 ? "text-success" : 
                  index === 1 ? "text-primary" : 
                  index === 2 ? "text-info" : "text-warning"
                }`} />
              </div>
              <span className={`flex items-center gap-1 text-xs font-medium ${stat.up ? "text-success" : "text-destructive"}`}>
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border card-shadow overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="text-lg font-bold text-foreground">{t("dashboard.recentOrders.title")}</h2>
            <Link to="/admin/orders" className="text-sm text-primary hover:underline">
              {t("dashboard.recentOrders.viewAll")}
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-start text-xs font-medium text-muted-foreground p-4">{t("dashboard.recentOrders.orderId")}</th>
                  <th className="text-start text-xs font-medium text-muted-foreground p-4">{t("dashboard.recentOrders.customer")}</th>
                  <th className="text-start text-xs font-medium text-muted-foreground p-4">{t("dashboard.recentOrders.service")}</th>
                  <th className="text-start text-xs font-medium text-muted-foreground p-4">{t("dashboard.recentOrders.amount")}</th>
                  <th className="text-start text-xs font-medium text-muted-foreground p-4">{t("dashboard.recentOrders.status")}</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recentOrders.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                            {t("dashboard.recentOrders.noOrders")}
                        </td>
                    </tr>
                ) : (
                    dashboard.recentOrders.map((order: any) => (
                    <tr key={order.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                        <td className="p-4 text-sm text-primary font-medium">#{order.id}</td>
                        <td className="p-4 text-sm text-foreground">{order.userName}</td>
                        <td className="p-4 text-sm text-foreground">{order.serviceName}</td>
                        <td className="p-4 text-sm text-foreground font-medium">{formatPrice(order.totalAmount)}</td>
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

        {/* Top Services */}
        <div className="bg-card rounded-xl border border-border card-shadow flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="text-lg font-bold text-foreground">{t("dashboard.topServices.title")}</h2>
            <Link to="/admin/services" className="text-sm text-primary hover:underline">
              {t("dashboard.topServices.viewAll")}
            </Link>
          </div>
          <div className="p-4 space-y-4 flex-1">
            {dashboard.topServices.length === 0 ? (
                 <div className="p-4 text-center text-muted-foreground text-sm">{t("dashboard.topServices.noData")}</div>
            ) : (
                dashboard.topServices.map((service: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                        {index + 1}
                    </span>
                    <div className="text-start">
                        <p className="text-sm font-medium text-foreground">{service.name}</p>
                        <p className="text-xs text-muted-foreground">{service.orders} {t("dashboard.topServices.orders")}</p>
                    </div>
                    </div>
                    <span className="text-sm font-bold text-success">{formatPrice(service.revenue)}</span>
                </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/admin/orders"
          className="bg-card rounded-xl p-5 border border-border hover:border-primary/50 transition-all hover:shadow-md flex items-center gap-4 card-shadow"
        >
          <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
            <ClipboardList className="w-6 h-6 text-warning" />
          </div>
          <div className="text-start">
            <p className="font-medium text-foreground">{t("dashboard.quickActions.pendingOrders", { count: dashboard.ordersByStatus.pending || 0 })}</p>
            <p className="text-sm text-muted-foreground">{t("dashboard.quickActions.needReview")}</p>
          </div>
        </Link>
        <Link
          to="/admin/users"
          className="bg-card rounded-xl p-5 border border-border hover:border-primary/50 transition-all hover:shadow-md flex items-center gap-4 card-shadow"
        >
          <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-info" />
          </div>
          <div className="text-start">
            <p className="font-medium text-foreground">{t("dashboard.quickActions.newUsers", { count: dashboard.recentUsers.length })}</p>
            <p className="text-sm text-muted-foreground">{t("dashboard.quickActions.lastRegistered")}</p>
          </div>
        </Link>
        <Link
          to="/admin/payments"
          className="bg-card rounded-xl p-5 border border-border hover:border-primary/50 transition-all hover:shadow-md flex items-center gap-4 card-shadow"
        >
          <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-success" />
          </div>
          <div className="text-start">
            <p className="font-medium text-foreground">{formatPrice(dashboard.totalRevenue)}</p>
            <p className="text-sm text-muted-foreground">{t("dashboard.quickActions.totalSales")}</p>
          </div>
        </Link>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
