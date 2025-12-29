import AdminLayout from "@/components/layouts/AdminLayout";
import { Search, Download, Eye, CheckCircle, XCircle, ChevronLeft, ChevronRight, DollarSign, CreditCard, Smartphone, Building } from "lucide-react";

const payments = [
  { id: "#PAY-001", user: "أحمد محمد", email: "ahmed@email.com", amount: "$50.00", method: "card", status: "completed", date: "2025-01-15 14:30" },
  { id: "#PAY-002", user: "سارة علي", email: "sara@email.com", amount: "$25.00", method: "apple", status: "completed", date: "2025-01-15 13:45" },
  { id: "#PAY-003", user: "محمد خالد", email: "mohamed@email.com", amount: "$100.00", method: "bank", status: "pending", date: "2025-01-15 12:20" },
  { id: "#PAY-004", user: "فاطمة أحمد", email: "fatima@email.com", amount: "$75.00", method: "stc", status: "completed", date: "2025-01-15 11:00" },
  { id: "#PAY-005", user: "عمر حسن", email: "omar@email.com", amount: "$30.00", method: "card", status: "failed", date: "2025-01-15 10:30" },
];

const methodIcons: Record<string, { icon: typeof CreditCard; label: string }> = {
  card: { icon: CreditCard, label: "بطاقة ائتمان" },
  apple: { icon: Smartphone, label: "Apple Pay" },
  stc: { icon: Smartphone, label: "STC Pay" },
  bank: { icon: Building, label: "تحويل بنكي" },
};

const AdminPayments = () => {
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
              <p className="text-xl font-bold text-foreground">$48,250</p>
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
              <p className="text-xl font-bold text-foreground">$2,450</p>
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
              <p className="text-xl font-bold text-foreground">$450</p>
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
              <p className="text-xl font-bold text-foreground">$120</p>
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
              className="w-full bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg pr-10 pl-4 py-2 text-sm border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select className="bg-secondary text-foreground rounded-lg px-4 py-2 text-sm border border-border focus:outline-none focus:border-primary">
            <option>جميع الحالات</option>
            <option>مكتمل</option>
            <option>قيد المراجعة</option>
            <option>فشل</option>
          </select>
          <select className="bg-secondary text-foreground rounded-lg px-4 py-2 text-sm border border-border focus:outline-none focus:border-primary">
            <option>جميع طرق الدفع</option>
            <option>بطاقة ائتمان</option>
            <option>Apple Pay</option>
            <option>STC Pay</option>
            <option>تحويل بنكي</option>
          </select>
          <input
            type="date"
            className="bg-secondary text-foreground rounded-lg px-4 py-2 text-sm border border-border focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden card-shadow">
        <div className="overflow-x-auto">
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
              {payments.map((payment) => {
                const method = methodIcons[payment.method];
                return (
                  <tr key={payment.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                    <td className="p-4 text-sm font-medium text-primary">{payment.id}</td>
                    <td className="p-4">
                      <p className="text-sm font-medium text-foreground">{payment.user}</p>
                      <p className="text-xs text-muted-foreground">{payment.email}</p>
                    </td>
                    <td className="p-4 text-sm font-bold text-foreground">{payment.amount}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <method.icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">{method.label}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{payment.date}</td>
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
                        <button className="p-2 rounded-lg hover:bg-secondary transition-colors" title="عرض">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </button>
                        {payment.status === "pending" && (
                          <>
                            <button className="p-2 rounded-lg hover:bg-success/10 transition-colors" title="قبول">
                              <CheckCircle className="w-4 h-4 text-success" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-destructive/10 transition-colors" title="رفض">
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
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <p className="text-sm text-muted-foreground">عرض 1-5 من 1,842 معاملة</p>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors disabled:opacity-50" disabled>
              <ChevronRight className="w-4 h-4 text-foreground" />
            </button>
            <button className="w-8 h-8 rounded-lg bg-primary text-primary-foreground text-sm font-medium">1</button>
            <button className="w-8 h-8 rounded-lg border border-border hover:bg-secondary text-sm text-foreground">2</button>
            <button className="w-8 h-8 rounded-lg border border-border hover:bg-secondary text-sm text-foreground">3</button>
            <span className="text-muted-foreground">...</span>
            <button className="w-8 h-8 rounded-lg border border-border hover:bg-secondary text-sm text-foreground">369</button>
            <button className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors">
              <ChevronLeft className="w-4 h-4 text-foreground" />
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPayments;
