import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Search, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  { id: 1, name: "زيادة مشاهدات يوتيوب", category: "يوتيوب", price: "$0.025", minOrder: 100, maxOrder: 100000 },
  { id: 2, name: "زيادة مشتركين يوتيوب", category: "يوتيوب", price: "$0.15", minOrder: 50, maxOrder: 10000 },
  { id: 3, name: "زيادة متابعين انستقرام", category: "انستقرام", price: "$0.02", minOrder: 100, maxOrder: 50000 },
  { id: 4, name: "زيادة لايكات انستقرام", category: "انستقرام", price: "$0.01", minOrder: 50, maxOrder: 100000 },
  { id: 5, name: "زيادة متابعين تويتر", category: "تويتر", price: "$0.03", minOrder: 100, maxOrder: 20000 },
  { id: 6, name: "زيادة مشاهدات تيك توك", category: "تيك توك", price: "$0.005", minOrder: 500, maxOrder: 500000 },
];

const ClientNewOrder = () => {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">طلب جديد</h1>
        <p className="text-muted-foreground">اختر الخدمة المطلوبة وأدخل تفاصيل الطلب</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service Selection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-xl border border-border p-6 card-shadow">
            <h2 className="text-lg font-bold text-foreground mb-4">اختر الخدمة</h2>
            
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="ابحث عن خدمة..."
                  className="w-full bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg pr-10 pl-4 py-2 text-sm border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <select className="bg-secondary text-foreground rounded-lg px-4 py-2 text-sm border border-border focus:outline-none focus:border-primary">
                <option>جميع المنصات</option>
                <option>يوتيوب</option>
                <option>انستقرام</option>
                <option>تويتر</option>
                <option>تيك توك</option>
              </select>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {services.map((service) => (
                <label
                  key={service.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <input type="radio" name="service" className="text-primary" />
                    <div>
                      <p className="font-medium text-foreground">{service.name}</p>
                      <p className="text-xs text-muted-foreground">
                        الحد الأدنى: {service.minOrder.toLocaleString()} | الحد الأقصى: {service.maxOrder.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="px-2 py-1 text-xs rounded-full bg-secondary text-foreground">
                      {service.category}
                    </span>
                    <p className="text-sm font-bold text-primary mt-1">{service.price}/1000</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 card-shadow">
            <h2 className="text-lg font-bold text-foreground mb-4">تفاصيل الطلب</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">الرابط</label>
                <input
                  type="url"
                  placeholder="أدخل رابط الفيديو أو الحساب..."
                  className="w-full bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg px-4 py-3 text-sm border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">الكمية</label>
                <input
                  type="number"
                  placeholder="أدخل الكمية المطلوبة..."
                  className="w-full bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg px-4 py-3 text-sm border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-card rounded-xl border border-border p-6 h-fit card-shadow sticky top-6">
          <h2 className="text-lg font-bold text-foreground mb-4">ملخص الطلب</h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">الخدمة:</span>
              <span className="text-foreground">-</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">الكمية:</span>
              <span className="text-foreground">-</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">السعر لكل 1000:</span>
              <span className="text-foreground">-</span>
            </div>
            <hr className="border-border" />
            <div className="flex justify-between font-bold">
              <span className="text-foreground">الإجمالي:</span>
              <span className="text-primary text-lg">$0.00</span>
            </div>
          </div>

          <div className="p-4 bg-secondary/50 rounded-lg mb-4">
            <p className="text-sm text-muted-foreground">
              رصيدك الحالي: <span className="text-success font-bold">$1,245.50</span>
            </p>
          </div>

          <button className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            تأكيد الطلب
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientNewOrder;
