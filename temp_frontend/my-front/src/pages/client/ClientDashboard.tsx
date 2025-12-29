import DashboardLayout from "@/components/layouts/DashboardLayout";
import StatusBadge from "@/components/common/StatusBadge";
import { Wallet, ClipboardList, DollarSign, Crown, Plus, Headphones, Clock, Settings } from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  { icon: Wallet, label: "الرصيد الحالي", value: "$1,245.50", change: "↑ تم إضافة $200 مؤخراً", color: "text-success" },
  { icon: ClipboardList, label: "إجمالي الطلبات", value: "8,432", note: "منذ إنشاء الحساب" },
  { icon: Clock, label: "الطلبات النشطة", value: "12", note: "3 طلبات قيد المعالجة", color: "text-warning" },
  { icon: DollarSign, label: "إجمالي الإنفاق", value: "$15,890", badge: "مستوى VIP الذهبي", badgeIcon: Crown },
];

const quickActions = [
  { icon: Plus, label: "طلب جديد", href: "/client/new-order" },
  { icon: Clock, label: "سجل الطلبات", href: "/client/orders" },
  { icon: Headphones, label: "تذكرة دعم", href: "/client/support" },
  { icon: Settings, label: "الإعدادات", href: "/client/profile" },
];

const notifications = [
  { id: 1, message: "تم اكتمال الطلب #48520", time: "منذ 2 ساعة", type: "success" },
  { id: 2, message: "تحديث جديد في خدمات الانستقرام", time: "تم خفض الأسعار بنسبة 10%", type: "info" },
  { id: 3, message: "مكافأة شحن رصيد", time: "احصل على 5% بونص عند الشحن بالعملات الرقمية", type: "promo" },
];

const recentOrders = [
  { id: "#48521", service: "زيادة مشاهدات يوتيوب", platform: "youtube", link: "utube.com/wat...", quantity: 1000, price: "$2.50", status: "processing" as const },
  { id: "#48520", service: "متابعين انستقرام [ضمان]", platform: "instagram", link: "stagram.com/u...", quantity: 500, price: "$1.20", status: "completed" as const },
  { id: "#48519", service: "لايكات تويتر سريع", platform: "twitter", link: "witter.com/sta...", quantity: 2000, price: "$5.00", status: "completed" as const },
  { id: "#48518", service: "مشاهدات تيك توك", platform: "tiktok", link: "iktok.com/@us...", quantity: 10000, price: "$0.50", status: "pending" as const },
];

const platformIcons: Record<string, string> = {
  youtube: "🔴",
  instagram: "📸",
  twitter: "✖️",
  tiktok: "🎵",
};

const ClientDashboard = () => {
  return (
    <DashboardLayout>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          أهلاً بك، يوسف 👋
        </h1>
        <p className="text-muted-foreground">
          إليك نظرة عامة على نشاط حسابك وأداء خدماتك.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-card rounded-xl p-5 border border-border card-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                index === 0 ? "bg-success/10" : 
                index === 1 ? "bg-primary/10" : 
                index === 2 ? "bg-warning/10" : "bg-info/10"
              }`}>
                <stat.icon className={`w-6 h-6 ${
                  index === 0 ? "text-success" : 
                  index === 1 ? "text-primary" : 
                  index === 2 ? "text-warning" : "text-info"
                }`} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            {stat.change && (
              <p className={`text-xs mt-1 ${stat.color || "text-muted-foreground"}`}>{stat.change}</p>
            )}
            {stat.note && (
              <p className={`text-xs mt-1 ${stat.color || "text-muted-foreground"}`}>{stat.note}</p>
            )}
            {stat.badge && (
              <p className="text-xs mt-2 flex items-center gap-1 text-warning">
                {stat.badgeIcon && <stat.badgeIcon className="w-4 h-4" />}
                {stat.badge}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {quickActions.map((action, index) => (
          <Link
            key={index}
            to={action.href}
            className="bg-card rounded-xl p-5 border border-border hover:border-primary/50 transition-all hover:shadow-md text-center group card-shadow"
          >
            <div className="w-12 h-12 mx-auto rounded-xl bg-secondary flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
              <action.icon className="w-6 h-6 text-foreground group-hover:text-primary transition-colors" />
            </div>
            <p className="font-medium text-foreground">{action.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border card-shadow">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="text-lg font-bold text-foreground">آخر الطلبات</h2>
            <Link to="/client/orders" className="text-sm text-primary hover:underline">
              عرض الكل
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">رقم الطلب</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">الخدمة</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">الرابط</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">الكمية</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">السعر</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                    <td className="p-4 text-sm text-foreground font-medium">{order.id}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span>{platformIcons[order.platform]}</span>
                        <span className="text-sm text-foreground">{order.service}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-primary">{order.link}</td>
                    <td className="p-4 text-sm text-foreground">{order.quantity.toLocaleString()}</td>
                    <td className="p-4 text-sm text-foreground">{order.price}</td>
                    <td className="p-4">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card rounded-xl border border-border card-shadow">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="text-lg font-bold text-foreground">التنبيهات</h2>
            <button className="text-sm text-primary hover:underline">تحديد كمقروء</button>
          </div>
          <div className="p-4 space-y-3">
            {notifications.map((notif) => (
              <div key={notif.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  notif.type === "success" ? "bg-success/10 text-success" :
                  notif.type === "info" ? "bg-info/10 text-info" : "bg-warning/10 text-warning"
                }`}>
                  {notif.type === "success" ? "✓" : notif.type === "info" ? "ℹ" : "🎁"}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{notif.message}</p>
                  <p className="text-xs text-muted-foreground">{notif.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-border">
            <button className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2 rounded-lg border border-border hover:bg-secondary">
              عرض كل التنبيهات
            </button>
          </div>
        </div>
      </div>

      {/* Promo Banner */}
      <div className="mt-6 bg-gradient-to-l from-primary to-primary/80 rounded-xl p-6 text-primary-foreground">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold mb-1">🚀 خدمة جديدة!</h3>
            <p className="text-primary-foreground/80">
              تم إضافة خدمات Threads الجديدة بأسعار منافسة. ابدأ بتنمية حسابك الآن.
            </p>
          </div>
          <Link
            to="/services"
            className="bg-card text-foreground px-6 py-3 rounded-lg font-medium hover:bg-card/90 transition-colors whitespace-nowrap"
          >
            تصفح الخدمات
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;
