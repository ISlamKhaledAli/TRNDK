import PublicLayout from "@/components/layouts/PublicLayout";
import Alert from "@/components/common/Alert";
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  Trash2,
  Lock,
  CreditCard,
  Building,
  Smartphone,
  Plus,
  Minus,
} from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { apiClient } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import { toast } from "sonner";
import { useTranslation, Trans } from "react-i18next";
import PriceDisplay from "@/components/common/PriceDisplay";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const CheckoutPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, totalPrice, clearCart } =
    useCart();
  const { refreshNotifications } = useNotifications();
  const { t, i18n } = useTranslation(["checkout", "common"]);
  const isRtl = i18n.language === "ar";
  const [loading, setLoading] = useState(false);
  const [taxRate, setTaxRate] = useState<number>(15);
  const [payoneerEnabled, setPayoneerEnabled] = useState(false);
  const [paypalEnabled, setPaypalEnabled] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<string>("paypal");
  const [paypalClientId, setPaypalClientId] = useState<string>(""); 

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await apiClient.getSetting("taxRate");
        setTaxRate(parseFloat(data.value));
      } catch (error) {
        console.error("Failed to fetch tax rate:", error);
      }

      try {
        const result = await apiClient.getConfig();
        if (result.data.payoneerEnabled) {
          setPayoneerEnabled(!true);
        }
        if (result.data.paypalClientId) {
            setPaypalClientId(result.data.paypalClientId);
        }
      } catch (error) {
        // Silent fail for config fetch
      }
    };
    fetchSettings();
  }, []);

  const subtotal = totalPrice;
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;



  const handlePayoneerCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error(t("messages.loginRequired"));
      return;
    }

    if (items.length === 0) {
      toast.error(t("messages.cartEmpty"));
      return;
    }

    setLoading(true);
    try {
      const referralCode = localStorage.getItem("referralCode") || undefined;
      const result = await apiClient.checkout({
        items: items.map((item) => ({
          serviceId: item.serviceId,
          quantity: item.quantity,
          link: item.link,
          price: item.price,
        })),
        paymentMethod: "payoneer",
        referralCode,
      });

      // Handle Redirection
      if (result.success && result.redirectUrl) {
        toast.success(
          t("messages.redirecting", {
            defaultValue: "Redirecting to Payoneer...",
          })
        );
        clearCart();
        refreshNotifications();
        window.location.href = result.redirectUrl;
        return;
      } else {
        throw new Error(
          result.error || "Failed to initiate payment redirection"
        );
      }
    } catch (error: any) {
      toast.error(error.message || t("messages.error"));
    } finally {
      setLoading(false);
    }
  };

  // Memoize PayPal options to prevent unnecessary script reloads
  const paypalOptions = useMemo(() => ({
      clientId: paypalClientId,
      currency: "USD",
      intent: "capture" // Explicitly set intent
  }), [paypalClientId]);

  const isCreatingOrder = useRef(false);

  const createPayPalOrder = async (data: any, actions: any) => {
    if (isCreatingOrder.current) {
        return ""; // Return empty string or handle as per SDK expectation for 'do nothing'
    }
    
    isCreatingOrder.current = true;

    try {
      if (!user) {
         toast.error(t("messages.loginRequired"));
         throw new Error("Login required");
      }
       
      const referralCode = localStorage.getItem("referralCode") || undefined;
      
      const result = await apiClient.checkout({
        items: items.map((item) => ({
            serviceId: item.serviceId,
            quantity: item.quantity,
            link: item.link,
            price: item.price,
        })),
        paymentMethod: "paypal",
        referralCode,
      });
      
      if (!result.success || !result.transactionId) {
          throw new Error("Failed to create local order");
      }

      const paypalOrder = await apiClient.createPayPalOrder(result.transactionId);
      
      if (!paypalOrder.orderId) {
          throw new Error("Invalid response from backend: missing orderId");
      }

      return paypalOrder.orderId;

    } catch (err: any) {
        const msg = err.message || "Could not initiate PayPal Checkout";
        toast.error(msg);
        isCreatingOrder.current = false; // Reset lock on error
        throw err;
    } 
    // Note: We do NOT reset isCreatingOrder.current = false on success immediately 
    // because the flow moves to onApprove. However, if the user closes the popup, 
    // the SDK might not give us a clean way to reset. 
    // Better strategy: Use a timeout or rely on SDK 'onCancel' to reset.
    // For now, let's keep it simple: reset after a short delay to allow re-tries if needed,
    // but long enough to block double clicks.
    setTimeout(() => { isCreatingOrder.current = false; }, 5000);
  };

  const onPayPalApprove = async (data: any, actions: any) => {
      try {
          await apiClient.capturePayPalOrder(data.orderID);
          toast.success("Payment successful!");
          clearCart();
          refreshNotifications();
          navigate("/client/orders");
      } catch (err: any) {
          // Show the specific error message from the backend (e.g. "Compliance Violation")
          toast.error(err.message || "Payment capture failed. Please contact support.");
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
            <span>{t("breadcrumb.cart")}</span>
            <span>/</span>
            <span className="text-primary">{t("breadcrumb.checkout")}</span>
          </nav>
        </div>
      </div>

      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>

        {!user && (
          <Alert type="info">
              <Trans
                i18nKey="loginAlert"
                ns="checkout"
                components={[
                  <Link
                    to="/login"
                    key="0"
                    className="text-primary font-bold hover:underline mx-1"
                  />
                ]}
              />
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Items */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-4 bg-secondary/30 border-b border-border">
                <h2 className="font-bold">{t("cart.title")}</h2>
              </div>
              <div className="divide-y divide-border">
                {items.length > 0 ? (
                  items.map((item) => (
                    <div key={item.id} className="group/item p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 hover:bg-secondary/20 transition-colors relative">
                      <div className="w-full sm:w-24 h-40 sm:h-24 rounded-xl bg-muted overflow-hidden shrink-0 shadow-sm border border-border/50 group-hover/item:border-primary/20 transition-colors">
                        <img
                          src={item.imagePath ? (item.imagePath.startsWith('http') ? item.imagePath : `/${item.imagePath}`) : "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=100&h=100&fit=crop"}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-1.5 gap-2">
                            <h3 className="font-bold text-base text-foreground line-clamp-1">
                              {item.name}
                            </h3>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all active:scale-90"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p
                            className="text-xs text-muted-foreground/80 mb-4 bg-muted/50 px-2 py-1 rounded inline-block max-w-full truncate"
                            dir="ltr"
                          >
                            {item.link}
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-4 mt-auto">
                          {/* Premium Quantity Selector - Visible for Growth Services ONLY */}
                          {item.category === "Growth Services" ? (
                            <div className="flex items-center gap-1 p-0.5 bg-secondary/50 rounded-lg border border-border/50 backdrop-blur-sm group/quantity focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/5 transition-all">
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    Math.max(100, item.quantity - 100)
                                  )
                                }
                                className="flex items-center justify-center w-7 h-7 rounded-md text-foreground hover:bg-primary hover:text-primary-foreground active:scale-90 transition-all"
                              >
                                <Minus className="w-3 h-3 stroke-[2.5]" />
                              </button>
                              
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  if (!isNaN(val)) {
                                    updateQuantity(item.id, val);
                                  }
                                }}
                                className="text-xs font-bold w-12 text-center bg-transparent border-none focus:outline-none focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />

                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 100)
                                }
                                className="flex items-center justify-center w-7 h-7 rounded-md text-foreground hover:bg-primary hover:text-primary-foreground active:scale-90 transition-all font-bold"
                              >
                                <Plus className="w-3 h-3 stroke-[2.5]" />
                              </button>
                            </div>
                          ) : (
                            <div className="h-[34px]" /> /* Hidden spacer to prevent layout shift */
                          )}

                          <div className="text-end">
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Subtotal</p>
                            <PriceDisplay
                              amount={item.category === "Growth Services" ? item.price * (item.quantity / 1000) : item.price}
                              isBold
                              className="items-end text-lg"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center space-y-4">
                    <p className="text-muted-foreground">{t("cart.empty")}</p>
                    <Link
                      to="/services"
                      className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors inline-block"
                    >
                      {t("cart.browse")}
                    </Link>
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
                <h2 className="text-xl font-bold">{t("payment.title")}</h2>
              </div>

              <div className="grid grid-cols-1 gap-3 mb-6">
                 {/* Payoneer Option */}
                 {payoneerEnabled && (
                  <label
                    className={`relative flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedMethod === "payoneer"
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="payoneer"
                      checked={selectedMethod === "payoneer"}
                      onChange={(e) => setSelectedMethod(e.target.value)}
                      className="w-4 h-4 text-primary"
                    />
                    <CreditCard className="w-5 h-5 text-primary shrink-0" />
                    <div className="text-start">
                      <p className="font-medium text-sm">Payoneer</p>
                      <p className="text-xs text-muted-foreground">Secure payment via Payoneer Gateway</p>
                    </div>
                  </label>
                 )}

                 {/* PayPal Option */}
                 {paypalEnabled && (
                  <label
                    className={`relative flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedMethod === "paypal"
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={selectedMethod === "paypal"}
                      onChange={(e) => setSelectedMethod(e.target.value)}
                      className="w-4 h-4 text-primary"
                    />
                    {/* PayPal Logic Icon or Text */}
                    <div className="font-bold text-blue-700 italic w-5 h-5 flex items-center justify-center">P</div>
                    <div className="text-start">
                      <p className="font-medium text-sm">PayPal</p>
                      <p className="text-xs text-muted-foreground">Pay safely with your PayPal account</p>
                    </div>
                  </label>
                 )}
              </div>
            </div>

            {/* Security Info */}
            <div className="bg-success/5 rounded-xl border border-success/20 p-6 flex items-center gap-3">
              <Lock className="w-5 h-5 text-success shrink-0" />
              <div className="text-start">
                <p className="font-medium text-success">
                  {t("security.title")}
                </p>
                <p className="text-sm text-success/80">
                  {t("security.description")}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar - Order Summary */}
          <div className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
              <h3 className="font-bold mb-4">{t("summary.title")}</h3>

              <div className="space-y-2 border-t border-border pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("summary.subtotal")}
                  </span>
                  <PriceDisplay amount={subtotal} className="items-end" />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("summary.tax")} ({taxRate}%)
                  </span>
                  <PriceDisplay amount={tax} className="items-end" />
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
                  <span>{t("summary.total")}</span>
                  <PriceDisplay
                    amount={total}
                    isBold
                    className="items-end text-lg"
                  />
                </div>
              </div>

              <div className="mt-6">
                {selectedMethod === "payoneer" ? (
                  <button
                    onClick={handlePayoneerCheckout}
                    disabled={loading || !user || items.length === 0}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-4 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                  >
                    <CreditCard className="w-5 h-5" />
                    {loading
                      ? t("summary.processing")
                      : t("summary.payWithPayoneer")}
                  </button>
                ) : (
                  <div className="w-full">
                     {paypalClientId ? (
                         <div className="w-full relative z-0"> 
                             {/* Wrapper to ensure isolation and proper stacking context */}
                             <PayPalScriptProvider options={paypalOptions}>
                                 <PayPalButtons 
                                    style={{ 
                                        layout: "horizontal", 
                                        color: "gold", 
                                        shape: "rect", 
                                        label: "paypal",
                                        tagline: false, // Disable the tagline text
                                        height: 45      // Match height of other buttons
                                    }}
                                    className="paypal-button-container"
                                    disabled={!user || items.length === 0}
                                    createOrder={createPayPalOrder}
                                    onApprove={onPayPalApprove}
                                    onCancel={() => {
                                        isCreatingOrder.current = false;
                                        toast.info(t("messages.paymentCancelled", { defaultValue: "Payment cancelled" }));
                                    }}
                                    onError={(err) => {
                                        isCreatingOrder.current = false;
                                        toast.error(t("messages.error", { defaultValue: "An error occurred with PayPal" }));
                                    }}
                                 />
                             </PayPalScriptProvider>
                         </div>
                     ) : (
                         <div className="text-center text-red-500 text-sm p-2 border border-red-200 bg-red-50 rounded">
                             PayPal Client ID is missing.
                         </div>
                     )}
                  </div>
                )}
              </div>
                <Link
                  to="/services"
                  className="block w-full border border-primary text-primary hover:bg-primary/5 py-3 rounded-lg font-semibold text-center transition-colors"
                >
                  {t("summary.continueShopping")}
                </Link>

            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default CheckoutPage;
