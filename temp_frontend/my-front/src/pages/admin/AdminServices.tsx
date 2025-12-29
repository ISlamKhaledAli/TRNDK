import AdminLayout from "@/components/layouts/AdminLayout";
import { Search, Plus, Edit, Trash2, ToggleLeft, ToggleRight, ChevronLeft, ChevronRight } from "lucide-react";

const services = [
  { id: 1, name: "زيادة مشاهدات يوتيوب", category: "يوتيوب", price: "$0.025", minOrder: 100, maxOrder: 100000, status: true },
  { id: 2, name: "زيادة مشتركين يوتيوب", category: "يوتيوب", price: "$0.15", minOrder: 50, maxOrder: 10000, status: true },
  { id: 3, name: "زيادة متابعين انستقرام", category: "انستقرام", price: "$0.02", minOrder: 100, maxOrder: 50000, status: true },
  { id: 4, name: "زيادة لايكات انستقرام", category: "انستقرام", price: "$0.01", minOrder: 50, maxOrder: 100000, status: true },
  { id: 5, name: "زيادة متابعين تويتر", category: "تويتر", price: "$0.03", minOrder: 100, maxOrder: 20000, status: false },
  { id: 6, name: "زيادة مشاهدات تيك توك", category: "تيك توك", price: "$0.005", minOrder: 500, maxOrder: 500000, status: true },
];

const AdminServices = () => {
  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">إدارة الخدمات</h1>
          <p className="text-muted-foreground">إضافة وتعديل الخدمات المتاحة</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          إضافة خدمة
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4 mb-6 card-shadow">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="ابحث عن خدمة..."
              className="w-full bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg pr-10 pl-4 py-2 text-sm border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select className="bg-secondary text-foreground rounded-lg px-4 py-2 text-sm border border-border focus:outline-none focus:border-primary">
            <option>جميع الفئات</option>
            <option>يوتيوب</option>
            <option>انستقرام</option>
            <option>تويتر</option>
            <option>تيك توك</option>
          </select>
          <select className="bg-secondary text-foreground rounded-lg px-4 py-2 text-sm border border-border focus:outline-none focus:border-primary">
            <option>جميع الحالات</option>
            <option>مفعّل</option>
            <option>معطّل</option>
          </select>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden card-shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-right text-xs font-medium text-muted-foreground p-4">#</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">اسم الخدمة</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">الفئة</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">السعر / 1000</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">الحد الأدنى</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">الحد الأقصى</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">الحالة</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                  <td className="p-4 text-sm text-muted-foreground">{service.id}</td>
                  <td className="p-4 text-sm font-medium text-foreground">{service.name}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-secondary text-foreground">
                      {service.category}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-foreground">{service.price}</td>
                  <td className="p-4 text-sm text-foreground">{service.minOrder.toLocaleString()}</td>
                  <td className="p-4 text-sm text-foreground">{service.maxOrder.toLocaleString()}</td>
                  <td className="p-4">
                    <button className="flex items-center">
                      {service.status ? (
                        <ToggleRight className="w-8 h-8 text-success" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-muted-foreground" />
                      )}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 rounded-lg hover:bg-secondary transition-colors" title="تعديل">
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-destructive/10 transition-colors" title="حذف">
                        <Trash2 className="w-4 h-4 text-destructive" />
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
          <p className="text-sm text-muted-foreground">عرض 1-6 من 24 خدمة</p>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors disabled:opacity-50" disabled>
              <ChevronRight className="w-4 h-4 text-foreground" />
            </button>
            <button className="w-8 h-8 rounded-lg bg-primary text-primary-foreground text-sm font-medium">1</button>
            <button className="w-8 h-8 rounded-lg border border-border hover:bg-secondary text-sm text-foreground">2</button>
            <button className="w-8 h-8 rounded-lg border border-border hover:bg-secondary text-sm text-foreground">3</button>
            <button className="w-8 h-8 rounded-lg border border-border hover:bg-secondary text-sm text-foreground">4</button>
            <button className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors">
              <ChevronLeft className="w-4 h-4 text-foreground" />
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminServices;
