import DashboardLayout from "@/components/layouts/DashboardLayout";
import { User, Mail, Phone, Lock, Save } from "lucide-react";

const ClientProfile = () => {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">الحساب & الأدوات</h1>
        <p className="text-muted-foreground">إدارة معلومات حسابك وإعداداتك</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Info */}
          <div className="bg-card rounded-xl border border-border p-6 card-shadow">
            <h2 className="text-lg font-bold text-foreground mb-4">المعلومات الشخصية</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">الاسم الكامل</label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" defaultValue="يوسف أحمد" className="w-full bg-secondary text-foreground rounded-lg pr-10 pl-4 py-3 text-sm border border-border focus:outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="email" defaultValue="yousef@email.com" className="w-full bg-secondary text-foreground rounded-lg pr-10 pl-4 py-3 text-sm border border-border focus:outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">رقم الجوال</label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="tel" defaultValue="+966501234567" dir="ltr" className="w-full bg-secondary text-foreground rounded-lg pr-10 pl-4 py-3 text-sm border border-border focus:outline-none focus:border-primary text-left" />
                </div>
              </div>
            </div>
            <button className="mt-4 bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
              <Save className="w-4 h-4" />
              حفظ التغييرات
            </button>
          </div>

          {/* Change Password */}
          <div className="bg-card rounded-xl border border-border p-6 card-shadow">
            <h2 className="text-lg font-bold text-foreground mb-4">تغيير كلمة المرور</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">كلمة المرور الحالية</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="password" className="w-full bg-secondary text-foreground rounded-lg pr-10 pl-4 py-3 text-sm border border-border focus:outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">كلمة المرور الجديدة</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="password" className="w-full bg-secondary text-foreground rounded-lg pr-10 pl-4 py-3 text-sm border border-border focus:outline-none focus:border-primary" />
                </div>
              </div>
            </div>
            <button className="mt-4 bg-secondary text-foreground px-6 py-2 rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors border border-border">
              تحديث كلمة المرور
            </button>
          </div>
        </div>

        {/* Account Summary */}
        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6 card-shadow">
            <div className="text-center mb-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <span className="text-2xl font-bold text-primary">ي</span>
              </div>
              <h3 className="font-bold text-foreground">يوسف أحمد</h3>
              <p className="text-sm text-muted-foreground">عضو مميز</p>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between p-3 bg-secondary/50 rounded-lg">
                <span className="text-muted-foreground">الرصيد:</span>
                <span className="font-bold text-success">$1,245.50</span>
              </div>
              <div className="flex justify-between p-3 bg-secondary/50 rounded-lg">
                <span className="text-muted-foreground">الطلبات:</span>
                <span className="font-bold text-foreground">8,432</span>
              </div>
              <div className="flex justify-between p-3 bg-secondary/50 rounded-lg">
                <span className="text-muted-foreground">تاريخ التسجيل:</span>
                <span className="font-bold text-foreground">2024-01-15</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientProfile;
