import { Eye, CreditCard, Loader2, Filter } from "lucide-react";
import { useState, useEffect } from "react";
import { useLoaderData, useRevalidator } from "react-router-dom";
import { useSocket } from "@/hooks/useSocket";
import { apiClient } from "@/services/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody, // Import DialogBody
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { formatPrice } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import StatusBadge from "@/components/common/StatusBadge";
import OrderDetailsViewer from "@/components/common/OrderDetailsViewer";
import DashboardLayout from "@/components/layouts/DashboardLayout";

interface Order {
  id: number;
  userId: number;
  serviceId: number;
  status: 'pending_payment' | 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled' | 'failed';
  totalAmount: number;
  createdAt: string;
  details?: any;
  lastNotifyAt?: string;
  transactionId?: string;
  service?: {
    name: string;
    duration?: string;
  };
}

const parseDurationMs = (durationStr: string): number => {
  try {
    const parts = durationStr.toLowerCase().split(' ');
    let unit = 'hours';
    if (parts.some(p => p.startsWith('minute'))) unit = 'minutes';
    else if (parts.some(p => p.startsWith('hour'))) unit = 'hours';
    else if (parts.some(p => p.startsWith('day'))) unit = 'days';

    const numbers = durationStr.match(/\d+/g);
    let val = 0;
    if (numbers && numbers.length > 0) {
      val = Math.max(...numbers.map(n => parseInt(n)));
    } else {
      val = 24; // fallback
    }

    switch(unit) {
      case 'minutes': return val * 60 * 1000;
      case 'hours': return val * 3600 * 1000;
      case 'days': return val * 86400 * 1000;
      default: return val * 3600 * 1000;
    }
  } catch {
    return 24 * 3600 * 1000;
  }
};

const ClientOrders = () => {
  const { orders: initialOrders } = useLoaderData() as { orders: Order[] };
  const { revalidate } = useRevalidator();
  const [orders, setOrders] = useState<Order[]>(Array.isArray(initialOrders) ? initialOrders : []);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { t, i18n } = useTranslation(["client", "common"]);
  const { on, off } = useSocket();

  useEffect(() => {
    const handleStatusUpdate = (order: any) => {
      console.log("[ClientOrders] Order status updated via socket, refreshing list");
      
      // Notify user
      toast.success(t("orders.notifications.statusUpdate", { defaultValue: "Order Status Updated!" }), {
        description: `${t("orders.id")}: #${order.id} - ${t(`common:status.${order.status}`)}`,
      });

      // Refresh data
      revalidate();
    };

    on("orderStatusUpdate", handleStatusUpdate);
    return () => off("orderStatusUpdate", handleStatusUpdate);
  }, [on, off, revalidate, t]);

  // Sync state if loader data changes
  useEffect(() => {
    setOrders(Array.isArray(initialOrders) ? initialOrders : []);
  }, [initialOrders]);

  // Reset modal state
  const [isPaying, setIsPaying] = useState<number | null>(null);

  const handlePay = async (transactionId: string, orderId: number) => {
    try {
      setIsPaying(orderId);
      const data = await apiClient.createPaymentIntent(transactionId);
      if (data.redirectUrl) {
         window.location.href = data.redirectUrl;
      } else {
         toast.error("No payment URL received");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to initiate payment");
      console.error(error);
    } finally {
      setIsPaying(null);
    }
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  const handleReportDelay = async () => {
    if (!selectedOrder) return;
    try {
      await apiClient.reportDelay(selectedOrder.id);
      
      toast.success(t("orders.delayReported", { defaultValue: "Delay Reported Successfully" }));
      
      // Update local state immediately
      setSelectedOrder((prev) => (prev ? { ...prev, lastNotifyAt: new Date().toISOString() } : null));
      revalidate();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const filteredOrders = orders.sort((a, b) => b.id - a.id);

  const currentLocale = i18n.language === 'ar' ? ar : enUS;

  // Derived state for selected order
  const getDelayButtonState = () => {
    if (!selectedOrder) return null;
    
    // Status MUST be active (processing or confirmed)
    if (!['processing', 'confirmed'].includes(selectedOrder.status)) return null;

    // Check estimated duration first
    const durationMs = selectedOrder.service?.duration 
      ? parseDurationMs(selectedOrder.service.duration) 
      : 24 * 3600 * 1000;
      
    const deadline = new Date(selectedOrder.createdAt).getTime() + durationMs;
    const isOverdue = Date.now() > deadline;

    if (!isOverdue) return null;

    // Cooldown logic
    if (selectedOrder.lastNotifyAt) {
      const lastNotify = new Date(selectedOrder.lastNotifyAt).getTime();
      const cooldownMs = 24 * 60 * 60 * 1000;
      const availableAt = lastNotify + cooldownMs;
      
      if (Date.now() < availableAt) {
        return {
          disabled: true,
          label: t("orders.delayCooldown", { defaultValue: "Available in 24h" }) 
          // Note: Ideally show cleaner time remaining, but static string for now as requested
        };
      }
    }

    return {
      disabled: false,
      label: t("orders.reportDelay", { defaultValue: "Report Delay" })
    };
  };

  const delayState = getDelayButtonState();

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">{t("orders.title")}</h1>
        <p className="text-muted-foreground">{t("orders.subtitle")}</p>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4 mb-6 card-shadow">
        <div className="flex flex-col md:flex-row gap-4">
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Filter className="w-4 h-4" />
            {t("orders.filter")}
          </button>
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
                  <th className="text-start text-xs font-medium text-muted-foreground p-4">{t("orders.amount")}</th>
                  <th className="text-start text-xs font-medium text-muted-foreground p-4">{t("orders.date")}</th>
                  <th className="text-start text-xs font-medium text-muted-foreground p-4">{t("common:status")}</th>
                  <th className="text-start text-xs font-medium text-muted-foreground p-4">{t("common:actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                    <td className="p-4 text-sm font-medium text-foreground">#{order.id}</td>
                    <td className="p-4 text-sm text-foreground">{formatPrice(order.totalAmount)} <span className="text-xs text-muted-foreground">{t("common:currency")}</span></td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US')}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                          title={t("common:view")}
                        >
                          <Eye className="w-4 h-4" />
                          {t("common:view")}
                        </button>
                        
                        {order.status === 'pending_payment' && order.transactionId && (
                          <button
                            onClick={() => handlePay(order.transactionId!, order.id)}
                            disabled={isPaying === order.id}
                            className="inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-700 font-bold"
                            title={t("orders.payNow")}
                          >
                            {isPaying === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                            {t("orders.payNow")}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>


      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="sm:max-w-3xl border border-border bg-card">
          <DialogHeader className="text-start">
            <DialogTitle className="text-xl font-bold text-foreground">{t("orders.details.title", { id: selectedOrder?.id })}</DialogTitle>
          </DialogHeader>
          
          <DialogBody>
            {selectedOrder && (
              <div className="space-y-6">
                {/* Summary Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Order Info */}
                  <div className="bg-secondary/50 rounded-lg p-4 space-y-3 text-start h-full">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">{t("orders.details.id")}</p>
                      <p className="text-sm font-medium text-foreground">#{selectedOrder.id}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">{t("orders.details.serviceId")}</p>
                      <p className="text-sm text-foreground">{selectedOrder.serviceId}</p>
                    </div>
                  </div>

                  {/* Financials & Date */}
                  <div className="bg-secondary/50 rounded-lg p-4 space-y-3 text-start h-full">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">{t("orders.details.total")}</p>
                      <p className="text-lg font-bold text-foreground">{formatPrice(selectedOrder.totalAmount)} <span className="text-sm font-normal text-muted-foreground">{t("common:currency")}</span></p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">{t("orders.details.date")}</p>
                      <p className="text-sm text-foreground">{format(new Date(selectedOrder.createdAt), "d MMMM yyyy", { locale: currentLocale })}</p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="bg-secondary/50 rounded-lg p-4 text-start h-full flex flex-col justify-center">
                    <p className="text-xs font-medium text-muted-foreground mb-2">{t("orders.details.status")}</p>
                     <div className="flex">
                      <StatusBadge status={selectedOrder.status} />
                    </div>
                  </div>
                </div>

                 {selectedOrder.details && (
                    <div className="bg-secondary/50 rounded-lg p-4 text-start overflow-hidden">
                       <span className="text-xs font-medium text-muted-foreground mb-3 block border-b border-border/50 pb-2">
                          {t("orders.details.additionalDetails")}
                       </span>
                       <div className="">
                          <OrderDetailsViewer 
                              data={selectedOrder.details} 
                              isRoot={true} 
                              titleLink={`/services/${selectedOrder.serviceId}`} 
                          />
                       </div>
                    </div>
                 )}
                
                {delayState && (
                  <button
                    onClick={handleReportDelay}
                    disabled={delayState.disabled}
                    className={`w-full px-4 py-2 rounded-lg border transition-colors text-sm font-medium ${
                      delayState.disabled
                        ? "border-border text-muted-foreground cursor-not-allowed bg-secondary/50"
                        : "border-red-500/50 text-red-500 hover:bg-red-500/10"
                    }`}
                  >
                    {delayState.label}
                  </button>
                )}

                <button 
                  onClick={handleCloseModal}
                  className="w-full px-4 py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors text-sm font-medium"
                >
                  {t("common:close")}
                </button>
              </div>
            )}
          </DialogBody>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ClientOrders;
