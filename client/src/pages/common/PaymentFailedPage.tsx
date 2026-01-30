
import { useSearchParams, Link } from "react-router-dom";
import { XCircle, RefreshCcw, HeadphonesIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

const PaymentFailedPage = () => {
  const [searchParams] = useSearchParams();
  const txId = searchParams.get("txId") || searchParams.get("transactionId");
  const { t } = useTranslation(["checkout", "common"]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-2xl border border-border p-8 text-center card-shadow-lg animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-destructive" />
        </div>
        
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {t("messages.error")}
        </h1>
        <p className="text-muted-foreground mb-8">
          Something went wrong with your payment. Please try again or contact support.
        </p>

        {txId && (
          <div className="bg-secondary/50 rounded-lg p-4 mb-8 text-start border border-destructive/10">
            <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
              {t("payments.modal.transactionId", { ns: "admin" })}
            </p>
            <p className="text-sm font-mono text-foreground break-all">
              {txId}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          <Link
            to="/checkout"
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all"
          >
            <RefreshCcw className="w-5 h-5" />
            Retry Payment
          </Link>
          
          <Link
            to="/client/orders"
            className="flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-6 py-3 rounded-xl font-bold hover:bg-secondary/80 transition-all"
          >
            <HeadphonesIcon className="w-5 h-5" />
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedPage;
