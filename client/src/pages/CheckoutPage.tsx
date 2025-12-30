import PublicLayout from "@/components/layouts/PublicLayout";
import Alert from "@/components/common/Alert";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Trash2, Lock, CreditCard, Building, Smartphone } from "lucide-react";
import { useState } from "react";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface LocationState {
  service?: any;
  quantity?: number;
  link?: string;
  totalAmount?: number;
}

const paymentMethods = [
  { id: "card", label: "بطاقة ائتمان / مدى", description: "دفع آمن وفوري", icon: CreditCard },
  { id: "apple", label: "Apple Pay", description: "أسرع وأسهل", icon: Smartphone },
  { id: "stc", label: "STC Pay", description: "محفظة رقمية", icon: Smartphone },
  { id: "bank", label: "تحويل بنكي", description: "إرفاق الإيصال", icon: Building },
];

const CheckoutPage = () => {
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");

  const state = location.state as LocationState || {};
  
  // If no service, redirect back to services
  if (!state.service && !loading) {
    return (
      <PublicLayout>
        <div className="container py-12 text-center">
          <p className="text-muted-foreground mb-4">No service selected</p>
          <Link to="/services" className="text-primary font-medium hover:underline">
            Back to Services
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const cartItems = state.service ? [{
    id: state.service.id,
    title: state.service.name,
    description: state.service.description,
    quantity: state.quantity || 1000,
    price: state.service.price / 100,
    image: state.service.imageUrl,
  }] : [];

  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const tax = subtotal * 0.15;
  const total = subtotal + tax;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to place an order');
      return;
    }

    if (!state.service) {
      toast.error('No service selected');
      return;
    }

    setLoading(true);
    try {
      const result = await apiClient.createOrder(
        user.id,
        state.service.id,
        Math.round(total * 100),
        {
          quantity: state.quantity,
          link: state.link,
          paymentMethod
        }
      );
      toast.success('Order placed successfully!');
      setTimeout(() => navigate('/client/orders'), 1500);
    } catch (error) {
      toast.error('Failed to place order');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

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

        {!user && (
          <Alert type="info">
            هل لديك حساب بالفعل؟{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              سجل دخولك الآن
            </Link>{" "}
            لحفظ طلباتك وتتبعها بسهولة.
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Method */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  1
                </span>
                <h2 className="text-xl font-bold">طريقة الدفع</h2>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className="relative flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary cursor-pointer transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                  >
                    <input 
                      type="radio" 
                      name="payment" 
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="sr-only" 
                    />
                    <method.icon className="w-5 h-5 text-muted-foreground" />
                    <div className="text-right">
                      <p className="font-medium text-sm">{method.label}</p>
                      <p className="text-xs text-muted-foreground">{method.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Security Info */}
            <div className="bg-success/10 rounded-xl border border-success/20 p-6 flex items-center gap-3">
              <Lock className="w-5 h-5 text-success shrink-0" />
              <div>
                <p className="font-medium text-success">عملية آمنة 100%</p>
                <p className="text-sm text-success/80">بيانات الدفع محمية بأعلى معايير الأمان</p>
              </div>
            </div>
          </div>

          {/* Sidebar - Order Summary */}
          <div className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-bold mb-4">ملخص الطلب</h3>

              {cartItems.length > 0 ? (
                <div className="space-y-4 mb-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.quantity.toLocaleString()} وحدة</p>
                      </div>
                      <p className="text-sm font-semibold">${item.price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mb-4">لا توجد عناصر في السلة</p>
              )}

              <div className="space-y-2 border-t border-border pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">المبلغ الفرعي</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">الضريبة (15%)</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
                  <span>الإجمالي</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>

              <form onSubmit={handleSubmitOrder} className="mt-6 space-y-3">
                <button 
                  type="submit"
                  disabled={loading || !user || cartItems.length === 0}
                  className="w-full btn-primary py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'جاري المعالجة...' : 'تأكيد الطلب'}
                </button>
                <Link to="/services" className="block w-full btn-outline py-3 rounded-lg font-semibold text-center">
                  العودة للخدمات
                </Link>
              </form>
            </div>

            {/* Info Box */}
            <div className="bg-primary/10 rounded-xl border border-primary/20 p-4">
              <p className="text-sm text-foreground font-medium mb-3">نقاط مهمة:</p>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>✓ تنفيذ فوري بعد التأكيد</li>
                <li>✓ ضمان 100%</li>
                <li>✓ دعم عملاء 24/7</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default CheckoutPage;
