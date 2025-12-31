import AdminLayout from "@/components/layouts/AdminLayout";
import { Search, Download, Eye, CheckCircle, XCircle, ChevronLeft, ChevronRight, DollarSign, CreditCard, Smartphone, Building, X } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

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

const methodIcons: Record<string, { icon: typeof CreditCard; label: string }> = {
  card: { icon: CreditCard, label: "بطاقة ائتمان" },
  apple: { icon: Smartphone, label: "Apple Pay" },
  stc: { icon: Smartphone, label: "STC Pay" },
  bank: { icon: Building, label: "تحويل بنكي" },
};

const AdminPayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [users, setUsers] = useState<Map<number, User>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const fetchData = async () => {
    try {
      const [paymentsRes, usersRes] = await Promise.all([
        apiClient.getAdminPaymentsList(),
        apiClient.getAdminUsersList(),
      ]);
      
      const paymentData = paymentsRes.data || paymentsRes;
      const userData = usersRes.data || usersRes;
      
      setPayments(Array.isArray(paymentData) ? paymentData : []);
      
      const userMap = new Map<number, User>();
      if (Array.isArray(userData)) {
        userData.forEach((u: any) => {
          userMap.set(u.id, { id: u.id, name: u.name, email: u.email });
        });
      }
      setUsers(userMap);
    } catch (error) {
      toast.error('Failed to load payments');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (paymentId: number, newStatus: string) => {
    try {
      await apiClient.updatePaymentStatus(paymentId, newStatus);
      toast.success('Payment status updated successfully');
      await fetchData();
      setSelectedPayment(null);
    } catch (error) {
      toast.error('Failed to update payment status');
      console.error('Error:', error);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const user = users.get(payment.userId);
    const matchesSearch = 
      payment.id.toString().includes(searchTerm) ||
      (user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || payment.method === methodFilter;
    
    return matchesSearch && matchesStatus && matchesMethod;
  });

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

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">إدارة المدفوعات</h1>
          <p className="text-muted-foreground">عرض ومراجعة جميع المعاملات المالية</p>
        </div>
        <button className="flex items-center gap-2 bg-secondary text-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors border border-border">
          <Download className="w-4 h-4" />
          تصدير التقرير
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-lg border border-border p-4 card-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">${(stats.totalRevenue / 100).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">إجمالي الإيرادات</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 card-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">${(stats.todayRevenue / 100).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">إيرادات اليوم</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 card-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">${(stats.pending / 100).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">قيد المراجعة</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 card-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">${(stats.failed / 100).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">فشل</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4 mb-6 card-shadow">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="ابحث برقم العملية أو اسم العميل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg pr-10 pl-4 py-2 text-sm border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-secondary text-foreground rounded-lg px-4 py-2 text-sm border border-border focus:outline-none focus:border-primary"
          >
            <option value="all">جميع الحالات</option>
            <option value="completed">مكتمل</option>
            <option value="pending">قيد المراجعة</option>
            <option value="failed">فشل</option>
          </select>
          <select 
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="bg-secondary text-foreground rounded-lg px-4 py-2 text-sm border border-border focus:outline-none focus:border-primary"
          >
            <option value="all">جميع طرق الدفع</option>
            <option value="card">بطاقة ائتمان</option>
            <option value="apple">Apple Pay</option>
            <option value="stc">STC Pay</option>
            <option value="bank">تحويل بنكي</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden card-shadow">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">لا توجد معاملات</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">رقم العملية</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">العميل</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">المبلغ</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">طريقة الدفع</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">التاريخ</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">الحالة</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => {
                  const method = methodIcons[payment.method];
                  const user = users.get(payment.userId);
                  return (
                    <tr key={payment.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                      <td className="p-4 text-sm font-medium text-primary">#{payment.id}</td>
                      <td className="p-4">
                        <p className="text-sm font-medium text-foreground">{user?.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
                      </td>
                      <td className="p-4 text-sm font-bold text-foreground">${(payment.amount / 100).toFixed(2)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <method.icon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">{method.label}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(payment.createdAt).toLocaleDateString('ar-SA')} {new Date(payment.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          payment.status === "completed" 
                            ? "bg-success/10 text-success" 
                            : payment.status === "pending"
                            ? "bg-warning/10 text-warning"
                            : "bg-destructive/10 text-destructive"
                        }`}>
                          {payment.status === "completed" ? "مكتمل" : payment.status === "pending" ? "قيد المراجعة" : "فشل"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setSelectedPayment(payment)}
                            className="p-2 rounded-lg hover:bg-secondary transition-colors" 
                            title="عرض"
                          >
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          </button>
                          {payment.status === "pending" && (
                            <>
                              <button 
                                onClick={() => handleStatusChange(payment.id, 'completed')}
                                className="p-2 rounded-lg hover:bg-success/10 transition-colors" 
                                title="قبول"
                              >
                                <CheckCircle className="w-4 h-4 text-success" />
                              </button>
                              <button 
                                onClick={() => handleStatusChange(payment.id, 'failed')}
                                className="p-2 rounded-lg hover:bg-destructive/10 transition-colors" 
                                title="رفض"
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
          <p className="text-sm text-muted-foreground">عرض {filteredPayments.length} من {payments.length} معاملة</p>
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

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">تفاصيل المعاملة</h2>
              <button 
                onClick={() => setSelectedPayment(null)}
                className="p-1 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Payment Info */}
              <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">رقم العملية</p>
                  <p className="text-sm font-medium text-foreground">#{selectedPayment.id}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">معرف المعاملة</p>
                  <p className="text-sm text-foreground">{selectedPayment.transactionId || 'N/A'}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">العميل</p>
                  <p className="text-sm font-medium text-foreground">{users.get(selectedPayment.userId)?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">البريد الإلكتروني</p>
                  <p className="text-sm text-foreground">{users.get(selectedPayment.userId)?.email || 'N/A'}</p>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">المبلغ</p>
                  <p className="text-lg font-bold text-foreground">${(selectedPayment.amount / 100).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">طريقة الدفع</p>
                  <p className="text-sm text-foreground">{methodIcons[selectedPayment.method].label}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">التاريخ</p>
                  <p className="text-sm text-foreground">{new Date(selectedPayment.createdAt).toLocaleDateString('ar-SA')}</p>
                </div>
              </div>

              {/* Status */}
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">الحالة</p>
                <span className={`inline-flex px-3 py-1 text-sm rounded-full font-medium ${
                  selectedPayment.status === "completed" 
                    ? "bg-success/10 text-success" 
                    : selectedPayment.status === "pending"
                    ? "bg-warning/10 text-warning"
                    : "bg-destructive/10 text-destructive"
                }`}>
                  {selectedPayment.status === "completed" ? "مكتمل" : selectedPayment.status === "pending" ? "قيد المراجعة" : "فشل"}
                </span>
              </div>

              {/* Action Buttons */}
              {selectedPayment.status === "pending" && (
                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => handleStatusChange(selectedPayment.id, 'completed')}
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-success/10 text-success hover:bg-success/20 transition-colors"
                  >
                    قبول
                  </button>
                  <button 
                    onClick={() => handleStatusChange(selectedPayment.id, 'failed')}
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                  >
                    رفض
                  </button>
                </div>
              )}

              <button 
                onClick={() => setSelectedPayment(null)}
                className="w-full px-4 py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors text-sm font-medium"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminPayments;
