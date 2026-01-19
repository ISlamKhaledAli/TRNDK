/**
 * client/src/App.tsx
 *
 * Root application component.
 * Sets up all context providers (Theme, Language, Auth, Cart, Currency, Notifications, Sidebar)
 * and configures React Query, routing, and toast notifications.
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "./contexts/LanguageContext";
import { SidebarProvider } from "./contexts/SidebarContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import { CartProvider } from "./contexts/CartContext";
import { NotificationsProvider } from "./contexts/NotificationsContext";
import { router } from "./router";
import GlobalErrorBoundary from "./components/common/GlobalErrorBoundary";
import { Suspense } from "react";
import { RootFallback } from "./components/layouts/RootLayout";

const queryClient = new QueryClient();

const App = () => (
  <GlobalErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <LanguageProvider>
          <SidebarProvider>
            <AuthProvider>
              <SocketProvider>
                <NotificationsProvider>
                  <CartProvider>
                    <CurrencyProvider>
                      <TooltipProvider>
                        <Toaster />
                        <Sonner />
                        <Suspense fallback={<RootFallback />}>
                          <RouterProvider router={router} />
                        </Suspense>
                      </TooltipProvider>
                    </CurrencyProvider>
                  </CartProvider>
                </NotificationsProvider>
              </SocketProvider>
            </AuthProvider>
          </SidebarProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </GlobalErrorBoundary>
);

export default App;
