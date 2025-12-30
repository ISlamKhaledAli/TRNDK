import DashboardLayout from "@/components/layouts/DashboardLayout";
import StatusBadge from "@/components/common/StatusBadge";
import { Search, Filter, Eye, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = async () => {
    try {
      const response = await apiClient.getMyOrders();
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

  const handleDelete = async (orderId: number) => {
    if (!confirm('Are you sure you want to delete this order?')) return;

    try {
      await apiClient.deleteOrder(orderId);
      toast.success('Order deleted successfully');
      setOrders(orders.filter(o => o.id !== orderId));
    } catch (error) {
      toast.error('Failed to delete order');
      console.error('Error:', error);
    }
  };

  const filteredOrders = orders.filter(order =>
    order.id.toString().includes(searchTerm) ||
    order.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">سجل الطلبات</h1>
        <p className="text-muted-foreground">عرض وتتبع جميع طلباتك السابقة والحالية</p>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4 mb-6 card-shadow">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="ابحث برقم الطلب..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg pr-10 pl-4 py-2 text-sm border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Filter className="w-4 h-4" />
            تصفية
          </button>
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
                    <td className="p-4 text-sm font-medium text-foreground">#{order.id}</td>
                    <td className="p-4 text-sm text-foreground">${(order.totalAmount / 100).toFixed(2)}</td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                          title="عرض"
                        >
                          <Eye className="w-4 h-4" />
                          عرض
                        </button>
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="inline-flex items-center gap-1 text-sm text-destructive hover:underline"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                          حذف
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
    </DashboardLayout>
  );
};

export default ClientOrders;
