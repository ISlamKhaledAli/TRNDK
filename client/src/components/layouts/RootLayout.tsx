import { Outlet, useNavigation } from "react-router-dom";
import ReferralTracker from "@/components/common/ReferralTracker";
import { Loader2 } from "lucide-react";

export default function RootLayout() {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  return (
    <>
      <ReferralTracker />
      
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}
      
      <Outlet />
    </>
  );
}

export const RootFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <Loader2 className="h-12 w-12 animate-spin text-primary" />
  </div>
);
