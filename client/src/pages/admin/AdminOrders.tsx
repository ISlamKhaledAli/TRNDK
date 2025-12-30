import AdminLayout from "@/components/layouts/AdminLayout";
import StatusBadge from "@/components/common/StatusBadge";
import { Search, Filter, Eye, Edit, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
  const [editingStatus, setEditingStatus] = useState<string>('');

  const fetchOrders = async () => {
    try {
      const response = await apiClient.getAdminOrdersList();
      const orderData = response.data || response;
      setOrders(Array.isArray(orderData) ? orderData : []);
    } catch (error) {
      toast.error('Failed to load orders');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await apiClient.updateOrderStatusAdmin(orderId, newStatus);
      toast.success('Order status updated successfully');
      setEditingOrderId(null);
      await fetchOrders();
    } catch (error) {
      toast.error('Failed to update order status');
      console.error('Error:', error);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toString().includes(searchTerm) ||
      (order.details?.link || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // Map order status to badge status
    const displayStatus = order.status === 'confirmed' ? 'processing' : order.status;
    const matchesStatus = statusFilter === 'all' || displayStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'confirmed').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">إدارة الطلبات</h1>
          <p className="text-muted-foreground">عرض ومراجعة جميع الطلبات</p>
        </div>
        <button className="flex items-center gap-2 bg-secondary text-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors border border-border">
          <Download className="w-4 h-4" />
          تصدير
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4 mb-6 card-shadow">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="ابحث برقم الطلب أو الرابط..."
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
            <option value="pending">قيد الانتظار</option>
            <option value="processing">قيد التنفيذ</option>
            <option value="completed">مكتمل</option>
            <option value="cancelled">ملغي</option>
          </select>
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Filter className="w-4 h-4" />
            تصفية
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-lg border border-border p-4 text-center card-shadow">
          <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
          <p className="text-sm text-muted-foreground">قيد الانتظار</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center card-shadow">
          <p className="text-2xl font-bold text-info">{stats.processing}</p>
          <p className="text-sm text-muted-foreground">قيد التنفيذ</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center card-shadow">
          <p className="text-2xl font-bold text-success">{stats.completed}</p>
          <p className="text-sm text-muted-foreground">مكتمل</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center card-shadow">
          <p className="text-2xl font-bold text-destructive">{stats.cancelled}</p>
          <p className="text-sm text-muted-foreground">ملغي</p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden card-shadow">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">لا توجد طلبات</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">رقم الطلب</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">المبلغ</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">التاريخ</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">الحالة</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                    <td className="p-4 text-sm font-medium text-primary">#{order.id}</td>
                    <td className="p-4 text-sm text-foreground">${(order.totalAmount / 100).toFixed(2)}</td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('ar-SA')}
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
                          <option value="pending">قيد الانتظار</option>
                          <option value="confirmed">مؤكد</option>
                          <option value="completed">مكتمل</option>
                          <option value="cancelled">ملغي</option>
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
                          title="تعديل الحالة"
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
          <p className="text-sm text-muted-foreground">عرض {filteredOrders.length} من {orders.length} طلب</p>
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
