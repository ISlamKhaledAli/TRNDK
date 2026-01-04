import AdminLayout from "@/components/layouts/AdminLayout";
import StatusBadge from "@/components/common/StatusBadge";
import { Filter, Eye, Edit, ChevronLeft, ChevronRight, Download, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "@/services/api";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useLoaderData, useRevalidator } from "react-router-dom";
import { useSocket } from "@/hooks/useSocket";

interface Order {
  id: number;
  userId: number;
  serviceId: number;
  status: any;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  details?: any;
}

const AdminOrders = () => {
  const { orders: initialOrders } = useLoaderData() as { orders: Order[] };
  const { revalidate } = useRevalidator();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
  const [editingStatus, setEditingStatus] = useState<string>('');
  const { t, i18n } = useTranslation(["admin", "common"]);
  const { on, off } = useSocket();

  useEffect(() => {
    const handleNewOrder = (order: any) => {
      console.log("[AdminOrders] New order received via socket:", order);
      
      // Play notification sound
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
      audio.play().catch(err => console.error("Error playing sound:", err));

      // Show visual notification
      toast.success(t("orders.notifications.newOrder", { defaultValue: "New Order Received!" }), {
        description: `#${order.id} - $${(order.totalAmount / 100).toFixed(2)}`,
      });

      // Refresh list instantly
      revalidate();
    };

    on("NEW_ORDER", handleNewOrder);
    return () => off("NEW_ORDER");
  }, [on, off, revalidate, t]);

  // Sync state if loader data changes
  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await apiClient.updateOrderStatusAdmin(orderId, newStatus);
      toast.success(t("orders.updateSuccess"));
      setEditingOrderId(null);
      revalidate();
    } catch (error) {
      toast.error(t("orders.updateError"));
      console.error('Error:', error);
    }
  };

  const filteredOrders = orders.filter(order => {
    // Map order status to badge status
    const displayStatus = order.status === 'confirmed' ? 'processing' : order.status;
    const matchesStatus = statusFilter === 'all' || displayStatus === statusFilter;
    
    return matchesStatus;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const stats = {
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'confirmed').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  const handleExport = () => {
    const headers = [t("orders.id"), t("orders.link"), t("common:amount"), t("common:date"), t("common:status")];
    const csvContent = [
      headers.join(","),
      ...filteredOrders.map(order => [
        `#${order.id}`,
        `"${order.details?.link || ""}"`,
        `$${(order.totalAmount / 100).toFixed(2)}`,
        new Date(order.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US'),
        order.status
      ].join(","))
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `orders-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(t("orders.exportSuccess"));
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{t("orders.title")}</h1>
          <p className="text-muted-foreground">{t("orders.subtitle")}</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 bg-secondary text-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors border border-border"
        >
          <Download className="w-4 h-4" />
          {t("common:export")}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4 mb-6 card-shadow">
        <div className="flex flex-col md:flex-row gap-4">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-secondary text-foreground rounded-lg px-4 py-2 text-sm border border-border focus:outline-none focus:border-primary"
          >
            <option value="all">{t("orders.statusAll")}</option>
            <option value="pending">{t("orders.statusPending")}</option>
            <option value="processing">{t("orders.statusProcessing")}</option>
            <option value="completed">{t("orders.statusCompleted")}</option>
            <option value="cancelled">{t("orders.statusCancelled")}</option>
          </select>
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Filter className="w-4 h-4" />
            {t("common:filter")}
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-lg border border-border p-4 text-center card-shadow">
          <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
          <p className="text-sm text-muted-foreground">{t("orders.statusPending")}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center card-shadow">
          <p className="text-2xl font-bold text-info">{stats.processing}</p>
          <p className="text-sm text-muted-foreground">{t("orders.statusProcessing")}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center card-shadow">
          <p className="text-2xl font-bold text-success">{stats.completed}</p>
          <p className="text-sm text-muted-foreground">{t("orders.statusCompleted")}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center card-shadow">
          <p className="text-2xl font-bold text-destructive">{stats.cancelled}</p>
          <p className="text-sm text-muted-foreground">{t("orders.statusCancelled")}</p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden card-shadow">
        <div className="overflow-x-auto">
          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">{t("orders.noOrders")}</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-start text-xs font-medium text-muted-foreground p-4">{t("orders.id")}</th>
                  <th className="text-start text-xs font-medium text-muted-foreground p-4">{t("orders.link")}</th>
                  <th className="text-start text-xs font-medium text-muted-foreground p-4">{t("common:amount")}</th>
                  <th className="text-start text-xs font-medium text-muted-foreground p-4">{t("common:date")}</th>
                  <th className="text-start text-xs font-medium text-muted-foreground p-4">{t("common:status")}</th>
                  <th className="text-start text-xs font-medium text-muted-foreground p-4">{t("common:actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                    <td className="p-4 text-sm font-medium text-primary">#{order.id}</td>
                    <td className="p-4">
                      {order.details?.link ? (
                        <div className="flex items-center gap-2 max-w-[250px]">
                          <span 
                            className="text-xs font-mono bg-secondary/80 px-2 py-1 rounded truncate select-all cursor-text text-foreground border border-border/50" 
                            title={order.details.link}
                          >
                            {order.details.link}
                          </span>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(order.details.link);
                              toast.success(t("common:copy") + "!");
                            }}
                            className="p-1.5 hover:bg-accent rounded-md transition-colors text-muted-foreground hover:text-primary shrink-0"
                            title={t("common:copy")}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">{t("orders.noLink")}</span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-foreground">${(order.totalAmount / 100).toFixed(2)}</td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US')}
                    </td>
                    <td className="p-4">
                      {editingOrderId === order.id ? (
                        <select
                          value={editingStatus}
                          onChange={(e) => {
                            setEditingStatus(e.target.value);
                            handleStatusChange(order.id, e.target.value);
                          }}
                          className="bg-secondary text-foreground rounded-lg px-2 py-1 text-xs border border-border focus:outline-none"
                          autoFocus
                        >
                          <option value="pending">{t("orders.statusPending")}</option>
                          <option value="confirmed">{t("orders.statusProcessing")}</option>
                          <option value="completed">{t("orders.statusCompleted")}</option>
                          <option value="cancelled">{t("orders.statusCancelled")}</option>
                        </select>
                      ) : (
                        <StatusBadge status={order.status === 'confirmed' ? 'processing' : order.status} />
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            setEditingOrderId(order.id);
                            setEditingStatus(order.status);
                          }}
                          className="p-2 rounded-lg hover:bg-secondary transition-colors" 
                          title={t("common:edit")}
                        >
                          <Edit className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            {t("orders.pagination", { count: filteredOrders.length, total: orders.length })}
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors disabled:opacity-50" disabled>
              <ChevronRight className="w-4 h-4 text-foreground" />
            </button>
            <button className="w-8 h-8 rounded-lg bg-primary text-primary-foreground text-sm font-medium">1</button>
            <button className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors">
              <ChevronLeft className="w-4 h-4 text-foreground" />
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
