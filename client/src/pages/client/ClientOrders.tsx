import { Filter, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { useLoaderData, useRevalidator } from "react-router-dom";
import { useSocket } from "@/hooks/useSocket";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import StatusBadge from "@/components/common/StatusBadge";
import OrderDetailsViewer from "@/components/common/OrderDetailsViewer";
import DashboardLayout from "@/components/layouts/DashboardLayout";

interface Order {
  id: number;
  userId: number;
  serviceId: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalAmount: number;
  createdAt: string;
  details?: any;
}

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

    on("STATUS_UPDATE", handleStatusUpdate);
    return () => off("STATUS_UPDATE");
  }, [on, off, revalidate, t]);

  // Sync state if loader data changes
  useEffect(() => {
    setOrders(Array.isArray(initialOrders) ? initialOrders : []);
  }, [initialOrders]);

  // Reset modal state
  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  const filteredOrders = orders.sort((a, b) => b.id - a.id);

  const currentLocale = i18n.language === 'ar' ? ar : enUS;

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
                    <td className="p-4 text-sm text-foreground">{(order.totalAmount / 100).toFixed(2)} <span className="text-xs text-muted-foreground">{t("common:currency")}</span></td>
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
        <DialogContent className="sm:max-w-3xl p-6 border border-border bg-card">
          <DialogHeader className="mb-6 text-start">
            <DialogTitle className="text-xl font-bold text-foreground">{t("orders.details.title", { id: selectedOrder?.id })}</DialogTitle>
          </DialogHeader>
          
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
                    <p className="text-lg font-bold text-foreground">{(selectedOrder.totalAmount / 100).toFixed(2)} <span className="text-sm font-normal text-muted-foreground">{t("common:currency")}</span></p>
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
                     <div className="max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
                        <OrderDetailsViewer 
                            data={selectedOrder.details} 
                            isRoot={true} 
                            titleLink={`/services/${selectedOrder.serviceId}`} 
                        />
                     </div>
                  </div>
               )}

              <button 
                onClick={handleCloseModal}
                className="w-full px-4 py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors text-sm font-medium"
              >
                {t("common:close")}
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ClientOrders;
