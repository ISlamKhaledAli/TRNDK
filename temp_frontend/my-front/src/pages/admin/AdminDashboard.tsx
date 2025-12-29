import AdminLayout from "@/components/layouts/AdminLayout";
import { Users, ClipboardList, DollarSign, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";
import { Link } from "react-router-dom";
import StatusBadge from "@/components/common/StatusBadge";

const stats = [
  { icon: DollarSign, label: "إجمالي الإيرادات", value: "$48,250", change: "+12.5%", up: true },
  { icon: ClipboardList, label: "إجمالي الطلبات", value: "3,842", change: "+8.2%", up: true },
  { icon: Users, label: "المستخدمين", value: "1,247", change: "+15.3%", up: true },
  { icon: TrendingUp, label: "معدل التحويل", value: "24.8%", change: "-2.1%", up: false },
];

const recentOrders = [
  { id: "#48521", user: "أحمد محمد", service: "زيادة مشاهدات يوتيوب", amount: "$25.00", status: "processing" as const, date: "منذ 5 دقائق" },
  { id: "#48520", user: "سارة علي", service: "متابعين انستقرام", amount: "$12.00", status: "completed" as const, date: "منذ 15 دقيقة" },
  { id: "#48519", user: "محمد خالد", service: "لايكات تويتر", amount: "$5.00", status: "pending" as const, date: "منذ 30 دقيقة" },
  { id: "#48518", user: "فاطمة أحمد", service: "مشاهدات تيك توك", amount: "$8.50", status: "completed" as const, date: "منذ ساعة" },
  { id: "#48517", user: "عمر حسن", service: "مشتركين يوتيوب", amount: "$45.00", status: "processing" as const, date: "منذ ساعتين" },
];

const topServices = [
  { name: "زيادة متابعين انستقرام", orders: 1250, revenue: "$12,500" },
  { name: "زيادة مشاهدات يوتيوب", orders: 980, revenue: "$9,800" },
  { name: "مشتركين يوتيوب", orders: 750, revenue: "$15,000" },
  { name: "لايكات تيك توك", orders: 620, revenue: "$3,100" },
];

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">لوحة التحكم</h1>
        <p className="text-muted-foreground">مرحباً بك في لوحة تحكم الإدارة</p>
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
                {stat.up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
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
        <div className="lg:col-span-2 bg-card rounded-xl border border-border card-shadow">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="text-lg font-bold text-foreground">آخر الطلبات</h2>
            <Link to="/admin/orders" className="text-sm text-primary hover:underline">
              عرض الكل
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">رقم الطلب</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">العميل</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">الخدمة</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">المبلغ</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">الحالة</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">الوقت</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                    <td className="p-4 text-sm text-primary font-medium">{order.id}</td>
                    <td className="p-4 text-sm text-foreground">{order.user}</td>
                    <td className="p-4 text-sm text-foreground">{order.service}</td>
                    <td className="p-4 text-sm text-foreground font-medium">{order.amount}</td>
                    <td className="p-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Services */}
        <div className="bg-card rounded-xl border border-border card-shadow">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="text-lg font-bold text-foreground">أفضل الخدمات</h2>
            <Link to="/admin/services" className="text-sm text-primary hover:underline">
              عرض الكل
            </Link>
          </div>
          <div className="p-4 space-y-4">
            {topServices.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{service.name}</p>
                    <p className="text-xs text-muted-foreground">{service.orders} طلب</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-success">{service.revenue}</span>
              </div>
            ))}
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
          <div>
            <p className="font-medium text-foreground">12 طلب قيد الانتظار</p>
            <p className="text-sm text-muted-foreground">تحتاج للمراجعة</p>
          </div>
        </Link>
        <Link
          to="/admin/users"
          className="bg-card rounded-xl p-5 border border-border hover:border-primary/50 transition-all hover:shadow-md flex items-center gap-4 card-shadow"
        >
          <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-info" />
          </div>
          <div>
            <p className="font-medium text-foreground">5 مستخدمين جدد</p>
            <p className="text-sm text-muted-foreground">آخر 24 ساعة</p>
          </div>
        </Link>
        <Link
          to="/admin/payments"
          className="bg-card rounded-xl p-5 border border-border hover:border-primary/50 transition-all hover:shadow-md flex items-center gap-4 card-shadow"
        >
          <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-success" />
          </div>
          <div>
            <p className="font-medium text-foreground">$2,450 اليوم</p>
            <p className="text-sm text-muted-foreground">إجمالي المبيعات</p>
          </div>
        </Link>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
