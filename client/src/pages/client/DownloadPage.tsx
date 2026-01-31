import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Download, FileText, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "@/services/api";

const DownloadPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { t } = useTranslation(["common", "orders"]);
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const ordersRes = await apiClient.getMyOrders();
        const foundOrder = ordersRes.data.find((o: any) => o.id === Number(orderId));
        
        if (!foundOrder) {
          setError(t("client:digitalDownload.errorTitle") + ": Order not found");
          return;
        }

        if (foundOrder.status !== "completed") {
          setError(t("client:digitalDownload.errorTitle") + ": Status is " + foundOrder.status);
          return;
        }

        if (foundOrder.service.category !== "Digital Library") {
           setError(t("client:digitalDownload.errorTitle") + ": Not a digital product");
           return;
        }

        setOrder(foundOrder);
      } catch (err: any) {
        setError(t("client:digitalDownload.errorTitle"));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrder();
  }, [orderId, t]);

  const handleDownload = () => {
    // We point to the secure API endpoint
    window.location.href = `/api/v1/orders/${orderId}/download`;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">{t("loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">{t("client:digitalDownload.errorTitle")}</h1>
        <p className="text-muted-foreground max-w-md mb-8">{error}</p>
        <button 
          onClick={() => navigate("/client/orders")}
          className="flex items-center gap-2 text-primary hover:underline font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("client:digitalDownload.backToOrders")}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-start mb-8">
        <button 
          onClick={() => navigate("/client/orders")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {t("client:digitalDownload.backToOrders")}
        </button>
        <h1 className="text-3xl font-bold text-foreground mb-2">{t("client:digitalDownload.title")}</h1>
        <p className="text-muted-foreground">{t("client:digitalDownload.subtitle")}</p>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden card-shadow">
        <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
            <div className="relative">
               <FileText className="w-16 h-16 md:w-24 md:h-24 text-primary opacity-20" />
               <Download className="absolute inset-0 w-8 h-8 md:w-12 md:h-12 text-primary m-auto" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-bold uppercase mb-4">
               {t("client:digitalDownload.verified")}
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">{order.service.name}</h2>
            <p className="text-muted-foreground mb-6 line-clamp-3">
              {order.service.description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleDownload}
                className="flex items-center justify-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20"
              >
                <Download className="w-6 h-6" />
                {t("client:digitalDownload.downloadButton")}
              </button>
              <div className="flex flex-col justify-center">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">{t("client:digitalDownload.orderId")}</span>
                <span className="text-sm font-mono text-foreground">#{order.id}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-secondary/50 border-t border-border p-6 px-8 md:px-12 flex items-start gap-4">
          <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-start">
            <p className="text-sm text-foreground font-semibold mb-1 italic">{t("client:digitalDownload.securityTitle")}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("client:digitalDownload.securityDesc")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;
