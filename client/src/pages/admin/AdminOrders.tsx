import AdminLayout from "@/components/layouts/AdminLayout";
import StatusBadge from "@/components/common/StatusBadge";
import { Search, Filter, Eye, Edit, ChevronLeft, ChevronRight, Download } from "lucide-react";

const orders = [
  { id: "#48521", user: "أحمد محمد", email: "ahmed@email.com", service: "زيادة مشاهدات يوتيوب", quantity: 1000, price: "$25.00", status: "processing" as const, date: "2025-01-15 14:30" },
  { id: "#48520", user: "سارة علي", email: "sara@email.com", service: "متابعين انستقرام", quantity: 500, price: "$12.00", status: "completed" as const, date: "2025-01-15 13:45" },
  { id: "#48519", user: "محمد خالد", email: "mohamed@email.com", service: "لايكات تويتر", quantity: 2000, price: "$5.00", status: "pending" as const, date: "2025-01-15 12:20" },
  { id: "#48518", user: "فاطمة أحمد", email: "fatima@email.com", service: "مشاهدات تيك توك", quantity: 10000, price: "$8.50", status: "completed" as const, date: "2025-01-15 11:00" },
  { id: "#48517", user: "عمر حسن", email: "omar@email.com", service: "مشتركين يوتيوب", quantity: 200, price: "$45.00", status: "processing" as const, date: "2025-01-15 10:30" },
  { id: "#48516", user: "نورة سعيد", email: "noura@email.com", service: "تعليقات انستقرام", quantity: 50, price: "$3.00", status: "cancelled" as const, date: "2025-01-14 18:00" },
];

const AdminOrders = () => {
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
              placeholder="ابحث برقم الطلب، اسم العميل، أو البريد..."
              className="w-full bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg pr-10 pl-4 py-2 text-sm border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select className="bg-secondary text-foreground rounded-lg px-4 py-2 text-sm border border-border focus:outline-none focus:border-primary">
            <option>جميع الحالات</option>
            <option>قيد الانتظار</option>
            <option>قيد التنفيذ</option>
            <option>مكتمل</option>
            <option>ملغي</option>
          </select>
          <input
            type="date"
            className="bg-secondary text-foreground rounded-lg px-4 py-2 text-sm border border-border focus:outline-none focus:border-primary"
          />
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Filter className="w-4 h-4" />
            تصفية
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-lg border border-border p-4 text-center card-shadow">
          <p className="text-2xl font-bold text-foreground">156</p>
          <p className="text-sm text-muted-foreground">قيد الانتظار</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center card-shadow">
          <p className="text-2xl font-bold text-info">48</p>
          <p className="text-sm text-muted-foreground">قيد التنفيذ</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center card-shadow">
          <p className="text-2xl font-bold text-success">3,520</p>
          <p className="text-sm text-muted-foreground">مكتمل</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center card-shadow">
          <p className="text-2xl font-bold text-destructive">118</p>
          <p className="text-sm text-muted-foreground">ملغي</p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden card-shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-right text-xs font-medium text-muted-foreground p-4">
                  <input type="checkbox" className="rounded border-border" />
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">رقم الطلب</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">العميل</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">الخدمة</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">الكمية</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">المبلغ</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">التاريخ</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">الحالة</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                  <td className="p-4">
                    <input type="checkbox" className="rounded border-border" />
                  </td>
                  <td className="p-4 text-sm font-medium text-primary">{order.id}</td>
                  <td className="p-4">
                    <p className="text-sm font-medium text-foreground">{order.user}</p>
                    <p className="text-xs text-muted-foreground">{order.email}</p>
                  </td>
                  <td className="p-4 text-sm text-foreground">{order.service}</td>
                  <td className="p-4 text-sm text-foreground">{order.quantity.toLocaleString()}</td>
                  <td className="p-4 text-sm font-medium text-foreground">{order.price}</td>
                  <td className="p-4 text-sm text-muted-foreground">{order.date}</td>
                  <td className="p-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 rounded-lg hover:bg-secondary transition-colors" title="عرض">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-secondary transition-colors" title="تعديل الحالة">
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <p className="text-sm text-muted-foreground">عرض 1-6 من 3,842 طلب</p>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors disabled:opacity-50" disabled>
              <ChevronRight className="w-4 h-4 text-foreground" />
            </button>
            <button className="w-8 h-8 rounded-lg bg-primary text-primary-foreground text-sm font-medium">1</button>
            <button className="w-8 h-8 rounded-lg border border-border hover:bg-secondary text-sm text-foreground">2</button>
            <button className="w-8 h-8 rounded-lg border border-border hover:bg-secondary text-sm text-foreground">3</button>
            <span className="text-muted-foreground">...</span>
            <button className="w-8 h-8 rounded-lg border border-border hover:bg-secondary text-sm text-foreground">641</button>
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
