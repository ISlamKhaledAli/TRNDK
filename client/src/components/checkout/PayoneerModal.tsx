import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useState } from "react";
import { apiClient } from "@/services/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface PayoneerModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  totalAmount: number; // For display only
  currency?: string;
}

export function PayoneerModal({ 
  isOpen, 
  onClose, 
  transactionId, 
  totalAmount, 
  currency = 'USD' 
}: PayoneerModalProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Security: We only send the transactionId. 
      // The backend calculates the amount and validates ownership.
      const intent = await apiClient.createPaymentIntent(transactionId);
      
      if (intent.url) {
        toast.success("Redirecting to Payoneer...");
        window.location.href = intent.url;
      } else {
        throw new Error("No redirect URL received");
      }
    } catch (error: any) {
      console.error("Payment initiation failed:", error);
      toast.error(error.message || "Failed to start payment");
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !loading && !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Your Purchase</DialogTitle>
          <DialogDescription>
            Pay securely with Payoneer. You will be redirected to complete the payment.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6 space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Transaction ID</span>
            <span className="font-mono">{transactionId}</span>
          </div>
          
          <div className="flex justify-between items-center border-t pt-4">
            <span className="font-semibold">Total to Pay</span>
            <span className="text-xl font-bold">
              {formatPrice(totalAmount)} {currency}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button 
            onClick={handlePayment} 
            disabled={loading}
            className="w-full bg-[#FF4800] hover:bg-[#E64100] text-white" // Payoneer Orange-ish brand color
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay with Payoneer`
            )}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
