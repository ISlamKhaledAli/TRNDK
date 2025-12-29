import PublicLayout from "@/components/layouts/PublicLayout";
import Alert from "@/components/common/Alert";
import { Link } from "react-router-dom";
import { Home, Trash2, Lock, CreditCard, Building, Smartphone } from "lucide-react";

const cartItems = [
  {
    id: 1,
    title: "زيادة متابعين انستقرام",
    description: "جودة عالية - ضمان ذهبي",
    quantity: 1000,
    price: 99,
    image: "https://images.unsplash.com/photo-1611262588024-d12430b98920?w=100&h=100&fit=crop",
  },
  {
    id: 2,
    title: "زيادة مشاهدات يوتيوب",
    description: "حقيقي - تفعيل الربح",
    quantity: 5000,
    price: 150,
    image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=100&h=100&fit=crop",
  },
];

const paymentMethods = [
  { id: "card", label: "بطاقة ائتمان / مدى", description: "دفع آمن وفوري", icon: CreditCard },
  { id: "apple", label: "Apple Pay", description: "أسرع وأسهل", icon: Smartphone },
  { id: "stc", label: "STC Pay", description: "محفظة رقمية", icon: Smartphone },
  { id: "bank", label: "تحويل بنكي", description: "إرفاق الإيصال", icon: Building },
];

const CheckoutPage = () => {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const tax = subtotal * 0.15;
  const total = subtotal + tax;

  return (
    <PublicLayout>
      {/* Breadcrumb */}
      <div className="bg-card border-b border-border py-4">
        <div className="container">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">
              <Home className="w-4 h-4" />
            </Link>
            <span>/</span>
            <span>سلة المشتريات</span>
            <span>/</span>
            <span className="text-primary">إتمام الطلب</span>
          </nav>
        </div>
      </div>

      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">إتمام الطلب</h1>

        <Alert type="info">
          هل لديك حساب بالفعل؟{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            سجل دخولك الآن
          </Link>{" "}
          لحفظ طلباتك وتتبعها بسهولة.
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Data */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  1
                </span>
                <h2 className="text-xl font-bold">بيانات العميل</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">رقم الجوال *</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 rounded-r-lg border border-l-0 border-input bg-muted text-sm text-muted-foreground">
                      +966
                    </span>
                    <input
                      type="tel"
                      placeholder="5xxxxxxxx"
                      className="input-base rounded-r-none"
                      dir="ltr"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">سيصلك رمز التحقق على هذا الرقم</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">البريد الإلكتروني (اختياري)</label>
                  <input
                    type="email"
                    placeholder="example@domain.com"
                    className="input-base"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  2
                </span>
                <h2 className="text-xl font-bold">طريقة الدفع</h2>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className="relative flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary cursor-pointer transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                  >
                    <input type="radio" name="payment" className="sr-only" defaultChecked={method.id === "card"} />
                    <method.icon className="w-5 h-5 text-muted-foreground" />
                    <div className="text-right">
                      <p className="font-medium text-sm">{method.label}</p>
                      <p className="text-xs text-muted-foreground">{method.description}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* Card Details */}
              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="font-medium">بيانات البطاقة</h3>
                <div>
                  <label className="block text-sm font-medium mb-2">الاسم على البطاقة</label>
                  <input
                    type="text"
                    placeholder="الاسم كما يظهر على البطاقة"
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">رقم البطاقة</label>
                  <input
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    className="input-base"
                    dir="ltr"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">تاريخ الانتهاء</label>
                    <input
                      type="text"
                      placeholder="MM / YY"
                      className="input-base"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">رمز التحقق (CVC)</label>
                    <input
                      type="text"
                      placeholder="123"
                      className="input-base"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">ملخص الطلب</h2>

              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                      <p className="text-xs text-muted-foreground">الكمية: {item.quantity}</p>
                    </div>
                    <div className="text-left shrink-0">
                      <p className="font-bold">{item.price} ر.س</p>
                      <button className="text-destructive text-xs hover:underline flex items-center gap-1 mt-1">
                        <Trash2 className="w-3 h-3" />
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">كود الخصم</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="أدخل كود الخصم"
                    className="input-base flex-1"
                  />
                  <button className="btn-outline px-4 rounded-lg text-sm font-medium">
                    تطبيق
                  </button>
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-2 py-4 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">المجموع الفرعي</span>
                  <span>{subtotal} ر.س</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">الضريبة (15%)</span>
                  <span>{tax.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                  <span>الإجمالي النهائي</span>
                  <span className="text-primary">{total.toFixed(2)} ر.س</span>
                </div>
              </div>

              {/* Submit */}
              <button className="w-full btn-primary py-4 rounded-lg font-semibold flex items-center justify-center gap-2 mt-4">
                <Lock className="w-5 h-5" />
                إتمام الدفع
              </button>

              <p className="text-xs text-center text-muted-foreground mt-3 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" />
                عملية دفع آمنة ومشفرة 100%
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default CheckoutPage;
