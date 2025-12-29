import AdminLayout from "@/components/layouts/AdminLayout";
import { Search, UserPlus, Eye, Edit, Ban, ChevronLeft, ChevronRight, Crown } from "lucide-react";

const users = [
  { id: 1, name: "أحمد محمد", email: "ahmed@email.com", phone: "+966501234567", balance: "$245.50", orders: 156, status: "active", vip: true, joined: "2024-06-15" },
  { id: 2, name: "سارة علي", email: "sara@email.com", phone: "+966507654321", balance: "$89.00", orders: 42, status: "active", vip: false, joined: "2024-08-20" },
  { id: 3, name: "محمد خالد", email: "mohamed@email.com", phone: "+966509876543", balance: "$0.00", orders: 8, status: "suspended", vip: false, joined: "2024-11-10" },
  { id: 4, name: "فاطمة أحمد", email: "fatima@email.com", phone: "+966502468135", balance: "$567.25", orders: 289, status: "active", vip: true, joined: "2024-03-05" },
  { id: 5, name: "عمر حسن", email: "omar@email.com", phone: "+966501357924", balance: "$34.00", orders: 23, status: "active", vip: false, joined: "2024-12-01" },
];

const AdminUsers = () => {
  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">إدارة المستخدمين</h1>
          <p className="text-muted-foreground">عرض وإدارة حسابات المستخدمين</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <UserPlus className="w-4 h-4" />
          إضافة مستخدم
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-lg border border-border p-4 text-center card-shadow">
          <p className="text-2xl font-bold text-foreground">1,247</p>
          <p className="text-sm text-muted-foreground">إجمالي المستخدمين</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center card-shadow">
          <p className="text-2xl font-bold text-success">1,198</p>
          <p className="text-sm text-muted-foreground">نشط</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center card-shadow">
          <p className="text-2xl font-bold text-warning">156</p>
          <p className="text-sm text-muted-foreground">VIP</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center card-shadow">
          <p className="text-2xl font-bold text-destructive">49</p>
          <p className="text-sm text-muted-foreground">موقوف</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4 mb-6 card-shadow">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="ابحث بالاسم، البريد، أو رقم الجوال..."
              className="w-full bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg pr-10 pl-4 py-2 text-sm border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select className="bg-secondary text-foreground rounded-lg px-4 py-2 text-sm border border-border focus:outline-none focus:border-primary">
            <option>جميع الحالات</option>
            <option>نشط</option>
            <option>موقوف</option>
          </select>
          <select className="bg-secondary text-foreground rounded-lg px-4 py-2 text-sm border border-border focus:outline-none focus:border-primary">
            <option>جميع المستويات</option>
            <option>VIP</option>
            <option>عادي</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden card-shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-right text-xs font-medium text-muted-foreground p-4">#</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">المستخدم</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">رقم الجوال</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">الرصيد</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">الطلبات</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">تاريخ التسجيل</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">الحالة</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                  <td className="p-4 text-sm text-muted-foreground">{user.id}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">{user.name[0]}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">{user.name}</p>
                          {user.vip && <Crown className="w-4 h-4 text-warning" />}
                        </div>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-foreground" dir="ltr">{user.phone}</td>
                  <td className="p-4 text-sm font-medium text-foreground">{user.balance}</td>
                  <td className="p-4 text-sm text-foreground">{user.orders}</td>
                  <td className="p-4 text-sm text-muted-foreground">{user.joined}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.status === "active" 
                        ? "bg-success/10 text-success" 
                        : "bg-destructive/10 text-destructive"
                    }`}>
                      {user.status === "active" ? "نشط" : "موقوف"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 rounded-lg hover:bg-secondary transition-colors" title="عرض">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-secondary transition-colors" title="تعديل">
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-destructive/10 transition-colors" title="إيقاف">
                        <Ban className="w-4 h-4 text-destructive" />
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
          <p className="text-sm text-muted-foreground">عرض 1-5 من 1,247 مستخدم</p>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors disabled:opacity-50" disabled>
              <ChevronRight className="w-4 h-4 text-foreground" />
            </button>
            <button className="w-8 h-8 rounded-lg bg-primary text-primary-foreground text-sm font-medium">1</button>
            <button className="w-8 h-8 rounded-lg border border-border hover:bg-secondary text-sm text-foreground">2</button>
            <button className="w-8 h-8 rounded-lg border border-border hover:bg-secondary text-sm text-foreground">3</button>
            <span className="text-muted-foreground">...</span>
            <button className="w-8 h-8 rounded-lg border border-border hover:bg-secondary text-sm text-foreground">250</button>
            <button className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors">
              <ChevronLeft className="w-4 h-4 text-foreground" />
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
