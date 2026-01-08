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
import { useState, useEffect } from "react";
import { apiClient } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import { toast } from "sonner";
import { useTranslation, Trans } from "react-i18next";
import PriceDisplay from "@/components/common/PriceDisplay";

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
  const [payoneerEnabled, setPayoneerEnabled] = useState(true);
  const paymentMethod = "payoneer"; // Forced single method

  const paymentMethodsList = [
    {
      id: "payoneer",
      label: t("payment.methods.payoneer.label", { defaultValue: "Payoneer" }),
      description: t("payment.methods.payoneer.description", {
        defaultValue: "Secure payment via Payoneer Gateway",
      }),
      icon: CreditCard,
    },
  ];

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
          setPayoneerEnabled(true);
        }
      } catch (error) {
        console.error("Failed to fetch config:", error);
      }
    };
    fetchSettings();
  }, []);

  const subtotal = totalPrice;
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  const handleSubmitOrder = async (e: React.FormEvent) => {
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
        paymentMethod,
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
      console.error("Error:", error);
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
              components={{
                link: (
                  <Link
                    to="/login"
                    className="text-primary font-medium hover:underline"
                  />
                ),
              }}
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
                    <div key={item.id} className="p-4 flex gap-4">
                      <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden shrink-0">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 text-start">
                        <div className="flex justify-between items-start mb-1 gap-2">
                          <h3 className="font-semibold text-sm line-clamp-1">
                            {item.name}
                          </h3>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-muted-foreground hover:text-destructive shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p
                          className="text-xs text-muted-foreground mb-3 truncate"
                          dir="ltr"
                        >
                          {item.link}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 border border-border rounded-lg p-1 bg-secondary/30">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  Math.max(100, item.quantity - 100)
                                )
                              }
                              className="p-1 hover:bg-card rounded transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-medium w-12 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 100)
                              }
                              className="p-1 hover:bg-card rounded transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <PriceDisplay
                            amount={item.price * (item.quantity / 1000)}
                            isBold
                            className="items-end"
                          />
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
                {paymentMethodsList.map((method) => (
                  <div
                    key={method.id}
                    className="relative flex items-center gap-3 p-4 rounded-lg border border-primary bg-primary/5"
                  >
                    <CreditCard className="w-5 h-5 text-primary shrink-0" />
                    <div className="text-start">
                      <p className="font-medium text-sm">{method.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {method.description}
                      </p>
                    </div>
                    <div className="ms-auto">
                      <span className="text-xs font-bold text-primary px-2 py-1 bg-primary/10 rounded uppercase">
                        {t("payment.required", { defaultValue: "Required" })}
                      </span>
                    </div>
                  </div>
                ))}
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

              <form onSubmit={handleSubmitOrder} className="mt-6 space-y-3">
                <button
                  type="submit"
                  disabled={loading || !user || items.length === 0}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-4 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                >
                  <CreditCard className="w-5 h-5" />
                  {loading
                    ? t("summary.processing")
                    : t("summary.payWithPayoneer", {
                        defaultValue: "Pay with Payoneer",
                      })}
                </button>
                <Link
                  to="/services"
                  className="block w-full border border-primary text-primary hover:bg-primary/5 py-3 rounded-lg font-semibold text-center transition-colors"
                >
                  {t("summary.continueShopping")}
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
