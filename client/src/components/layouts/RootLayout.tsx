import { Outlet, useNavigation, useLocation } from "react-router-dom";
import ReferralTracker from "@/components/common/ReferralTracker";
import ScrollToTop from "@/components/common/ScrollToTop";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useSidebar } from "@/contexts/SidebarContext";

export default function RootLayout() {
  const navigation = useNavigation();
  const location = useLocation();
  const { closeSidebar, isMobile } = useSidebar();
  const isLoading = navigation.state === "loading";

  // Universal fail-safe: Close sidebar on any navigation
  useEffect(() => {
    if (isMobile) {
      closeSidebar();
    }
  }, [location.pathname, isMobile, closeSidebar]);

  return (
    <>
      <ScrollToTop />
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
