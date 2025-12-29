import DashboardLayout from "@/components/layouts/DashboardLayout";
import StatusBadge from "@/components/common/StatusBadge";
import { Search, Filter, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const orders = [
  { id: "#48521", service: "زيادة مشاهدات يوتيوب", platform: "youtube", link: "youtube.com/watch?v=...", quantity: 1000, price: "$2.50", status: "processing" as const, date: "2025-01-15" },
  { id: "#48520", service: "متابعين انستقرام [ضمان]", platform: "instagram", link: "instagram.com/user...", quantity: 500, price: "$1.20", status: "completed" as const, date: "2025-01-14" },
  { id: "#48519", service: "لايكات تويتر سريع", platform: "twitter", link: "twitter.com/status/...", quantity: 2000, price: "$5.00", status: "completed" as const, date: "2025-01-14" },
  { id: "#48518", service: "مشاهدات تيك توك", platform: "tiktok", link: "tiktok.com/@user/...", quantity: 10000, price: "$0.50", status: "pending" as const, date: "2025-01-13" },
  { id: "#48517", service: "مشتركين يوتيوب", platform: "youtube", link: "youtube.com/c/...", quantity: 200, price: "$8.00", status: "completed" as const, date: "2025-01-12" },
  { id: "#48516", service: "تعليقات انستقرام", platform: "instagram", link: "instagram.com/p/...", quantity: 50, price: "$3.00", status: "cancelled" as const, date: "2025-01-11" },
];

const platformIcons: Record<string, string> = {
  youtube: "🔴",
  instagram: "📸",
  twitter: "✖️",
  tiktok: "🎵",
};

const ClientOrders = () => {
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
              placeholder="ابحث برقم الطلب أو الخدمة..."
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
          <select className="bg-secondary text-foreground rounded-lg px-4 py-2 text-sm border border-border focus:outline-none focus:border-primary">
            <option>جميع المنصات</option>
            <option>يوتيوب</option>
            <option>انستقرام</option>
            <option>تويتر</option>
            <option>تيك توك</option>
          </select>
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Filter className="w-4 h-4" />
            تصفية
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden card-shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-right text-xs font-medium text-muted-foreground p-4">رقم الطلب</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">الخدمة</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">الرابط</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">الكمية</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">السعر</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">التاريخ</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">الحالة</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                  <td className="p-4 text-sm font-medium text-foreground">{order.id}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span>{platformIcons[order.platform]}</span>
                      <span className="text-sm text-foreground">{order.service}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-primary max-w-[150px] truncate">{order.link}</td>
                  <td className="p-4 text-sm text-foreground">{order.quantity.toLocaleString()}</td>
                  <td className="p-4 text-sm text-foreground">{order.price}</td>
                  <td className="p-4 text-sm text-muted-foreground">{order.date}</td>
                  <td className="p-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="p-4">
                    <Link
                      to={`/client/orders/${order.id}`}
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <Eye className="w-4 h-4" />
                      عرض
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <p className="text-sm text-muted-foreground">عرض 1-6 من 48 طلب</p>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors disabled:opacity-50" disabled>
              <ChevronRight className="w-4 h-4 text-foreground" />
            </button>
            <button className="w-8 h-8 rounded-lg bg-primary text-primary-foreground text-sm font-medium">1</button>
            <button className="w-8 h-8 rounded-lg border border-border hover:bg-secondary text-sm text-foreground">2</button>
            <button className="w-8 h-8 rounded-lg border border-border hover:bg-secondary text-sm text-foreground">3</button>
            <button className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors">
              <ChevronLeft className="w-4 h-4 text-foreground" />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientOrders;
