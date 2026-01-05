/**
 * client/src/pages/admin/AdminPayments.tsx
 * 
 * Admin payments management page.
 * Displays all payment transactions with filtering, search, pagination,
 * and allows admins to view payment details and update payment statuses.
 */

import AdminLayout from "@/components/layouts/AdminLayout";
import { Download, Eye, CheckCircle, XCircle, ChevronLeft, ChevronRight, DollarSign, CreditCard, Smartphone, Building, X } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "@/services/api";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useLoaderData, useRevalidator } from "react-router-dom";
import { useSocket } from "@/hooks/useSocket";

interface Payment {
  id: number;
  userId: number;
  orderId?: number;
  amount: number;
  method: 'card' | 'apple' | 'stc' | 'bank';
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

const methodIcons: Record<string, { icon: typeof CreditCard; labelKey: string }> = {
  card: { icon: CreditCard, labelKey: "payments.methodCard" },
  apple: { icon: Smartphone, labelKey: "payments.methodApple" },
  stc: { icon: Smartphone, labelKey: "payments.methodStc" },
  bank: { icon: Building, labelKey: "payments.methodBank" },
};

const AdminPayments = () => {
  const { payments: initialPayments, users: initialUsers } = useLoaderData() as { payments: Payment[]; users: any[] };
  const { revalidate } = useRevalidator();
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [users, setUsers] = useState<Map<number, User>>(new Map());
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const { t, i18n } = useTranslation(["admin", "common"]);
  const { on, off } = useSocket();

  useEffect(() => {
    const handleNewOrder = (order: any) => {
      console.log("[AdminPayments] New order received via socket, refreshing payments list");
      
      // Play notification sound
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
      audio.play().catch(err => console.error("Error playing sound:", err));

      // Show toast
      toast.success(t("payments.notifications.newPayment", { defaultValue: "New Payment Received!" }), {
        description: `${t("payments.table.amount")}: $${(order.totalAmount / 100).toFixed(2)}`,
      });

      // Refresh data
      revalidate();
    };

    on("NEW_ORDER", handleNewOrder);
    return () => off("NEW_ORDER");
  }, [on, off, revalidate, t]);

  // Helper to build user map
  const buildUserMap = (userData: any[]) => {
    const userMap = new Map<number, User>();
    if (Array.isArray(userData)) {
      userData.forEach((u: any) => {
        userMap.set(u.id, { id: u.id, name: u.name, email: u.email });
      });
    }
    return userMap;
  };

  // Sync state if loader data changes
  useEffect(() => {
    setPayments(initialPayments);
    setUsers(buildUserMap(initialUsers));
  }, [initialPayments, initialUsers]);

  const handleStatusChange = async (paymentId: number, newStatus: string) => {
    try {
      await apiClient.updatePaymentStatus(paymentId, newStatus);
      toast.success(t("payments.updateSuccess"));
      revalidate();
      setSelectedPayment(null);
    } catch (error) {
      toast.error(t("payments.updateError"));
      console.error('Error:', error);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || payment.method === methodFilter;
    
    return matchesStatus && matchesMethod;
  }).sort((a, b) => b.id - a.id);

  const stats = {
    totalRevenue: payments.reduce((sum, p) => p.status === 'completed' ? sum + p.amount : sum, 0),
    todayRevenue: payments
      .filter(p => {
        const paymentDate = new Date(p.createdAt).toDateString();
        return paymentDate === new Date().toDateString() && p.status === 'completed';
      })
      .reduce((sum, p) => sum + p.amount, 0),
    pending: payments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0),
    failed: payments
      .filter(p => p.status === 'failed')
      .reduce((sum, p) => sum + p.amount, 0),
  };

  const handleExport = () => {
    const headers = [
      t("payments.table.id"), 
      t("payments.table.customer"), 
      t("admin.users.email"), 
      t("payments.table.amount"), 
      t("payments.table.method"), 
      t("payments.table.date"), 
      t("payments.table.status")
    ];
    const csvContent = [
      headers.join(","),
      ...filteredPayments.map(payment => {
        const user = users.get(payment.userId);
        const method = methodIcons[payment.method];
        return [
          `#${payment.id}`,
          `"${user?.name || 'Unknown'}"`,
          `"${user?.email || ""}"`,
          `$${(payment.amount / 100).toFixed(2)}`,
          `"${t(method.labelKey)}"`,
          new Date(payment.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US'),
          payment.status
        ].join(",");
      })
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `payments-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(t("payments.exportSuccess"));
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return t("payments.statusCompleted");
      case 'pending': return t("payments.statusPending");
      case 'failed': return t("payments.statusFailed");
      default: return status;
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{t("payments.title")}</h1>
          <p className="text-muted-foreground">{t("payments.subtitle")}</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 bg-secondary text-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors border border-border"
        >
          <Download className="w-4 h-4" />
          {t("payments.exportReport")}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-lg border border-border p-4 card-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-success" />
            </div>
            <div className="text-start">
              <p className="text-xl font-bold text-foreground">${(stats.totalRevenue / 100).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">{t("payments.stats.totalRevenue")}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 card-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-info" />
            </div>
            <div className="text-start">
              <p className="text-xl font-bold text-foreground">${(stats.todayRevenue / 100).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">{t("payments.stats.todayRevenue")}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 card-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-warning" />
            </div>
            <div className="text-start">
              <p className="text-xl font-bold text-foreground">${(stats.pending / 100).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">{t("payments.stats.pending")}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 card-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-destructive" />
            </div>
            <div className="text-start">
              <p className="text-xl font-bold text-foreground">${(stats.failed / 100).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">{t("payments.stats.failed")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4 mb-6 card-shadow">
        <div className="flex flex-col md:flex-row gap-4">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-secondary text-foreground rounded-lg px-4 py-2 text-sm border border-border focus:outline-none focus:border-primary"
          >
            <option value="all">{t("payments.statusAll")}</option>
            <option value="completed">{t("payments.statusCompleted")}</option>
            <option value="pending">{t("payments.statusPending")}</option>
            <option value="failed">{t("payments.statusFailed")}</option>
          </select>
          <select 
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="bg-secondary text-foreground rounded-lg px-4 py-2 text-sm border border-border focus:outline-none focus:border-primary"
          >
            <option value="all">{t("payments.methodAll")}</option>
            <option value="card">{t("payments.methodCard")}</option>
            <option value="apple">{t("payments.methodApple")}</option>
            <option value="stc">{t("payments.methodStc")}</option>
            <option value="bank">{t("payments.methodBank")}</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden card-shadow">
        <div className="overflow-x-auto">
          {filteredPayments.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">{t("payments.noTransactions")}</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-start text-xs font-medium text-muted-foreground p-4">{t("payments.table.id")}</th>
                  <th className="text-start text-xs font-medium text-muted-foreground p-4">{t("payments.table.customer")}</th>
                  <th className="text-start text-xs font-medium text-muted-foreground p-4">{t("payments.table.amount")}</th>
                  <th className="text-start text-xs font-medium text-muted-foreground p-4">{t("payments.table.method")}</th>
                  <th className="text-start text-xs font-medium text-muted-foreground p-4">{t("payments.table.date")}</th>
                  <th className="text-start text-xs font-medium text-muted-foreground p-4">{t("payments.table.status")}</th>
                  <th className="text-start text-xs font-medium text-muted-foreground p-4">{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => {
                  const method = methodIcons[payment.method];
                  const user = users.get(payment.userId);
                  const locale = i18n.language === 'ar' ? 'ar-SA' : 'en-US';
                  return (
                    <tr key={payment.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                      <td className="p-4 text-sm font-medium text-primary">#{payment.id}</td>
                      <td className="p-4 text-start">
                        <p className="text-sm font-medium text-foreground">{user?.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
                      </td>
                      <td className="p-4 text-sm font-bold text-foreground text-start">${(payment.amount / 100).toFixed(2)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <method.icon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">{t(method.labelKey)}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground text-start">
                        {new Date(payment.createdAt).toLocaleDateString(locale)} {new Date(payment.createdAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-4 text-start">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          payment.status === "completed" 
                            ? "bg-success/10 text-success" 
                            : payment.status === "pending"
                            ? "bg-warning/10 text-warning"
                            : "bg-destructive/10 text-destructive"
                        }`}>
                          {getStatusLabel(payment.status)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setSelectedPayment(payment)}
                            className="p-2 rounded-lg hover:bg-secondary transition-colors" 
                            title={t("common.view")}
                          >
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          </button>
                          {payment.status === "pending" && (
                            <>
                              <button 
                                onClick={() => handleStatusChange(payment.id, 'completed')}
                                className="p-2 rounded-lg hover:bg-success/10 transition-colors" 
                                title={t("payments.modal.accept")}
                              >
                                <CheckCircle className="w-4 h-4 text-success" />
                              </button>
                              <button 
                                onClick={() => handleStatusChange(payment.id, 'failed')}
                                className="p-2 rounded-lg hover:bg-destructive/10 transition-colors" 
                                title={t("payments.modal.reject")}
                              >
                                <XCircle className="w-4 h-4 text-destructive" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            {t("payments.pagination", { count: filteredPayments.length, total: payments.length })}
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors disabled:opacity-50" disabled>
              <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            </button>
            <button className="w-8 h-8 rounded-lg bg-primary text-primary-foreground text-sm font-medium">1</button>
            <button className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors">
              <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">{t("payments.modal.title")}</h2>
              <button 
                onClick={() => setSelectedPayment(null)}
                className="p-1 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Payment Info */}
              <div className="bg-secondary/50 rounded-lg p-4 space-y-3 text-start">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">{t("payments.modal.id")}</p>
                  <p className="text-sm font-medium text-foreground">#{selectedPayment.id}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">{t("payments.modal.transactionId")}</p>
                  <p className="text-sm text-foreground">{selectedPayment.transactionId || 'N/A'}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-secondary/50 rounded-lg p-4 space-y-3 text-start">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">{t("payments.modal.customer")}</p>
                  <p className="text-sm font-medium text-foreground">{users.get(selectedPayment.userId)?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">{t("payments.modal.email")}</p>
                  <p className="text-sm text-foreground">{users.get(selectedPayment.userId)?.email || 'N/A'}</p>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-secondary/50 rounded-lg p-4 space-y-3 text-start">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">{t("payments.modal.amount")}</p>
                  <p className="text-lg font-bold text-foreground">${(selectedPayment.amount / 100).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">{t("payments.modal.method")}</p>
                  <p className="text-sm text-foreground">{t(methodIcons[selectedPayment.method].labelKey)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">{t("payments.modal.date")}</p>
                  <p className="text-sm text-foreground">{new Date(selectedPayment.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US')}</p>
                </div>
              </div>

              {/* Status */}
              <div className="bg-secondary/50 rounded-lg p-4 text-start">
                <p className="text-xs font-medium text-muted-foreground mb-2">{t("payments.modal.status")}</p>
                <span className={`inline-flex px-3 py-1 text-sm rounded-full font-medium ${
                  selectedPayment.status === "completed" 
                    ? "bg-success/10 text-success" 
                    : selectedPayment.status === "pending"
                    ? "bg-warning/10 text-warning"
                    : "bg-destructive/10 text-destructive"
                }`}>
                  {getStatusLabel(selectedPayment.status)}
                </span>
              </div>

              {/* Action Buttons */}
              {selectedPayment.status === "pending" && (
                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => handleStatusChange(selectedPayment.id, 'completed')}
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-success/10 text-success hover:bg-success/20 transition-colors"
                  >
                    {t("payments.modal.accept")}
                  </button>
                  <button 
                    onClick={() => handleStatusChange(selectedPayment.id, 'failed')}
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                  >
                    {t("payments.modal.reject")}
                  </button>
                </div>
              )}

              <button 
                onClick={() => setSelectedPayment(null)}
                className="w-full px-4 py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors text-sm font-medium"
              >
                {t("common.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminPayments;
