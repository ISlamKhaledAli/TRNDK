import DashboardLayout from "@/components/layouts/DashboardLayout";
import { ShoppingCart } from "lucide-react";
import { Link, useNavigate, useLoaderData } from "react-router-dom";
import { useState } from "react";
import { apiClient } from "@/services/api";
import { toast } from "sonner";
import { useNotifications } from "@/contexts/NotificationsContext";
import { useTranslation } from "react-i18next";

interface Service {
  id: number;
  name: string;
  category: string;
  price: number;
  minOrder: number;
  maxOrder: number;
}

const ClientNewOrder = () => {
  const { services } = useLoaderData() as { services: Service[] };
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshNotifications } = useNotifications();
  const { t, i18n } = useTranslation(["client", "common"]);

  const totalAmount = selectedService && quantity 
    ? (Number(quantity) / 1000) * (selectedService.price / 100) 
    : 0;

  const handleSubmit = async () => {
    if (!selectedService || !link || !quantity) {
      toast.error(t("newOrder.fillAllFields"));
      return;
    }

    if (Number(quantity) < selectedService.minOrder || Number(quantity) > selectedService.maxOrder) {
      toast.error(t("newOrder.quantityRangeError", { min: selectedService.minOrder, max: selectedService.maxOrder }));
      return;
    }

    setLoading(true);
    try {
      await apiClient.createOrder({
        serviceId: selectedService.id,
        status: 'pending',
        totalAmount: Math.round(totalAmount * 100), // Convert to cents
        details: { link, quantity: Number(quantity) }
      });
      refreshNotifications(); // Trigger immediate notification update
      toast.success(t("newOrder.success"));
      navigate('/client/orders');
    } catch (error: any) {
      toast.error(error.message || t("newOrder.error"));
      console.error("Full Error Details:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">{t("newOrder.title")}</h1>
        <p className="text-muted-foreground">{t("newOrder.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service Selection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-xl border border-border p-6 card-shadow">
            <h2 className="text-lg font-bold text-foreground mb-4 text-start">{t("newOrder.selectService")}</h2>
            
            <div className="flex gap-4 mb-4">
              <div className="flex-1" />
              <select className="bg-secondary text-foreground rounded-lg px-4 py-2 text-sm border border-border focus:outline-none focus:border-primary">
                <option>{t("newOrder.allPlatforms")}</option>
                <option>{t("newOrder.youtube")}</option>
                <option>{t("newOrder.instagram")}</option>
                <option>{t("newOrder.twitter")}</option>
                <option>{t("newOrder.tiktok")}</option>
              </select>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {services.map((service) => (
                <label
                  key={service.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="service" 
                      className="text-primary"
                      checked={selectedService?.id === service.id}
                      onChange={() => setSelectedService(service)}
                    />
                    <div className="text-start">
                      <p className="font-medium text-foreground">{service.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("newOrder.minOrder")}: {service.minOrder?.toLocaleString() || '0'} | {t("newOrder.maxOrder")}: {service.maxOrder?.toLocaleString() || '-'}
                      </p>
                    </div>
                  </div>
                  <div className="text-end">
                    <span className="px-2 py-1 text-xs rounded-full bg-secondary text-foreground">
                      {service.category}
                    </span>
                    <p className="text-sm font-bold text-primary mt-1">${(service.price / 100).toFixed(3)}/1000</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 card-shadow">
            <h2 className="text-lg font-bold text-foreground mb-4 text-start">{t("newOrder.orderDetails")}</h2>
            
            <div className="space-y-4">
              <div className="text-start">
                <label className="block text-sm font-medium text-foreground mb-2">{t("newOrder.link")}</label>
                <input
                  type="url"
                  placeholder={t("newOrder.linkPlaceholder")}
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg px-4 py-3 text-sm border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="text-start">
                <label className="block text-sm font-medium text-foreground mb-2">{t("newOrder.quantity")}</label>
                <input
                  type="number"
                  placeholder={t("newOrder.quantityPlaceholder")}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg px-4 py-3 text-sm border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-card rounded-xl border border-border p-6 h-fit card-shadow sticky top-6">
          <h2 className="text-lg font-bold text-foreground mb-4 text-start">{t("newOrder.orderSummary")}</h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("newOrder.service")}</span>
              <span className="text-foreground text-end">{selectedService?.name || '-'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("newOrder.quantity")}</span>
              <span className="text-foreground">{quantity || '-'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("newOrder.pricePerThousand")}</span>
              <span className="text-foreground">{selectedService ? `$${(selectedService.price / 100).toFixed(3)}` : '-'}</span>
            </div>
            <hr className="border-border" />
            <div className="flex justify-between font-bold">
              <span className="text-foreground">{t("newOrder.total")}</span>
              <span className="text-primary text-lg">${totalAmount.toFixed(2)}</span>
            </div>
          </div>


          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ShoppingCart className="w-5 h-5" />
            {loading ? t("common:loading") : t("newOrder.confirmOrder")}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientNewOrder;
