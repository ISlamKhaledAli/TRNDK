import { useSearchParams } from "react-router-dom";
import { CreditCard, ShieldCheck, AlertCircle, ArrowLeftRight, Loader2 } from "lucide-react";
import PriceDisplay from "@/components/common/PriceDisplay";
import { useEffect, useState } from "react";
import { apiClient } from "@/services/api";

const MockPayoneerPage = () => {
  const [searchParams] = useSearchParams();
  const txId = searchParams.get("txId");
  const refId = searchParams.get("refId");
  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        if (refId) {
          const data = await apiClient.getPaymentDetails(refId);
          setPaymentData(data);
        }
      } catch (err: any) {
        console.error("Failed to fetch payment details:", err);
        setError("Could not load payment information. Please check the transaction ID.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [refId]);

  const handleSimulate = (status: "success" | "failed") => {
    const callbackUrl = `/api/v1/payments/payoneer/callback?txId=${txId}&refId=${refId}&status=${status}`;
    // Redirect to backend callback
    window.location.href = callbackUrl;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f7f9] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#cc0000] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7f9] flex items-center justify-center p-4 font-sans text-[#333]">
      <div className="w-full max-w-lg bg-white shadow-2xl rounded-sm overflow-hidden border-t-4 border-[#cc0000]">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#cc0000] rounded flex items-center justify-center text-white font-bold text-xl">
              P
            </div>
            <span className="text-xl font-semibold tracking-tight text-gray-800">Checkout <span className="text-[#cc0000]">Mock</span></span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <ShieldCheck className="w-3 h-3 text-green-500" />
            SECURE CHECKOUT
          </div>
        </div>

        <div className="p-8">
          {error ? (
            <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          ) : (
            <>
              {/* Order Summary */}
              <div className="mb-8 bg-gray-50 rounded-lg p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                  <span className="text-gray-500 font-medium text-sm">Amount to Pay</span>
                  <div className="text-2xl font-bold text-gray-900 flex items-baseline gap-1">
                    <PriceDisplay amount={paymentData?.amount || 0} isBold={false} className="text-2xl" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Transaction ID</span>
                    <span className="font-mono text-gray-800 bg-white px-2 py-0.5 rounded border border-gray-100">{txId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Merchant Reference</span>
                    <span className="font-mono text-gray-800 bg-white px-2 py-0.5 rounded border border-gray-100">{refId}</span>
                  </div>
                  {paymentData?.customerName && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Customer</span>
                      <span className="text-gray-800">{paymentData.customerName}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg border border-amber-100 text-amber-800 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>
                    This is a <strong>Mock Payment Page</strong>. No real money will be charged. 
                    Use the buttons below to simulate the Payoneer response.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <button
                    onClick={() => handleSimulate("success")}
                    className="flex items-center justify-center gap-2 bg-[#cc0000] hover:bg-[#b30000] text-white py-4 px-6 rounded font-bold transition-all shadow-md active:transform active:scale-95"
                  >
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                      ✓
                    </div>
                    SIMULATE SUCCESS
                  </button>
                  
                  <button
                    onClick={() => handleSimulate("failed")}
                    className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 py-4 px-6 rounded font-bold transition-all shadow-sm active:transform active:scale-95"
                  >
                    <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center border border-gray-300">
                      ✕
                    </div>
                    SIMULATE FAILURE
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col items-center gap-4">
          <div className="flex items-center gap-6 grayscale opacity-60">
             <div className="h-6 w-12 bg-gray-300 rounded-sm"></div>
             <div className="h-6 w-12 bg-gray-300 rounded-sm"></div>
             <div className="h-6 w-12 bg-gray-300 rounded-sm"></div>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
            <ArrowLeftRight className="w-3 h-3" />
            Secured and Powered by Payoneer Gateway Simulation
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockPayoneerPage;
