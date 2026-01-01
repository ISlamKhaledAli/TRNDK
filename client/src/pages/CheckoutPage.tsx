import PublicLayout from "@/components/layouts/PublicLayout";
import Alert from "@/components/common/Alert";
import { Link, useNavigate } from "react-router-dom";
import { Home, Trash2, Lock, CreditCard, Building, Smartphone, Plus, Minus } from "lucide-react";
import { useState } from "react";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const paymentMethods = [
  { id: "card", label: "بطاقة ائتمان / مدى", description: "دفع آمن وفوري", icon: CreditCard },
  { id: "apple", label: "Apple Pay", description: "أسرع وأسهل", icon: Smartphone },
  { id: "stc", label: "STC Pay", description: "محفظة رقمية", icon: Smartphone },
  { id: "bank", label: "تحويل بنكي", description: "إرفاق الإيصال", icon: Building },
];

const CheckoutPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");

  const subtotal = totalPrice;
  const tax = subtotal * 0.15;
  const total = subtotal + tax;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to place an order');
      return;
    }

    if (items.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setLoading(true);
    try {
      // For now, we'll process the first item as a single order to match the current backend
      // In a real app, you'd send all items or support multi-item orders
      const item = items[0];
      const result = await apiClient.createOrder(
        user.id,
        item.serviceId,
        Math.round(total * 100),
        {
          quantity: item.quantity,
          link: item.link,
          paymentMethod,
          cartItems: items // Send all items for backend support in future
        }
      );
      toast.success('Order placed successfully!');
      clearCart();
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
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Items */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-4 bg-secondary/30 border-b border-border">
                <h2 className="font-bold">العناصر المختارة</h2>
              </div>
              <div className="divide-y divide-border">
                {items.length > 0 ? (
                  items.map((item) => (
                    <div key={item.id} className="p-4 flex gap-4">
                      <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden shrink-0">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-semibold text-sm line-clamp-1">{item.name}</h3>
                          <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3 truncate" dir="ltr">{item.link}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 border border-border rounded-lg p-1 bg-secondary/30">
                            <button 
                              onClick={() => updateQuantity(item.id, Math.max(100, item.quantity - 100))}
                              className="p-1 hover:bg-card rounded transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-medium w-12 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 100)}
                              className="p-1 hover:bg-card rounded transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="font-bold text-primary">${((item.price / 100) * (item.quantity / 1000)).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center space-y-4">
                    <p className="text-muted-foreground">السلة فارغة</p>
                    <Link to="/services" className="btn-primary px-6 py-2 rounded-lg inline-block">تصفح الخدمات</Link>
                  </div>
                )}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
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
            <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
              <h3 className="font-bold mb-4">ملخص الطلب</h3>

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
                  disabled={loading || !user || items.length === 0}
                  className="w-full btn-primary py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'جاري المعالجة...' : 'تأكيد الطلب'}
                </button>
                <Link to="/services" className="block w-full btn-outline py-3 rounded-lg font-semibold text-center">
                  مواصلة التسوق
                </Link>
              </form>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default CheckoutPage;
