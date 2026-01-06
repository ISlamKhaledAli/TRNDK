import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { apiClient } from "@/services/api";

// Layouts and Guards
import PrivateRoute from "@/components/auth/PrivateRoute";
import PublicRoute from "@/components/auth/PublicRoute";

// Public Pages
import HomePage from "@/pages/common/HomePage";
import ServicesPage from "./pages/services/ServicesPage";
import OtherServicesPage from "./pages/services/OtherServicesPage";
import ServiceDetailsPage from "./pages/services/ServiceDetailsPage";
import CheckoutPage from "@/pages/common/CheckoutPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import NotFound from "@/pages/common/NotFound";

// Client Pages
import ClientDashboard from "@/pages/client/ClientDashboard";
import ClientOrders from "@/pages/client/ClientOrders";
import ClientNewOrder from "@/pages/client/ClientNewOrder";
import ClientProfile from "@/pages/client/ClientProfile";

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminServices from "@/pages/admin/AdminServices";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminPayments from "@/pages/admin/AdminPayments";
import AdminProfile from "@/pages/admin/AdminProfile";


const RootFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Outlet />,
    errorElement: <NotFound />,
    HydrateFallback: RootFallback,
    children: [
      // Public Routes
      {
        index: true,
        element: <HomePage />,
        HydrateFallback: RootFallback,
        loader: async () => {
          try {
            const res = await apiClient.getServices();
            return { services: res.data || res };
          } catch (e) {
            throw new Response("Failed to load services", { status: 500 });
          }
        }
      },
      {
        path: "/services",
        element: <ServicesPage />,
        loader: async () => {
          try {
            const res = await apiClient.getServices();
            return { services: res.data || res };
          } catch (e) {
            throw new Response("Failed to load services", { status: 500 });
          }
        }
      },
      {
        path: "/services/other",
        element: <OtherServicesPage />,
        loader: async () => {
          const { data } = await apiClient.getServices();
          return { services: data };
        },
      },
      {
        path: "/services/:id",
        element: <ServiceDetailsPage />,
        loader: async ({ params }) => {
          try {
            if (!params.id) throw new Response("Not Found", { status: 404 });
            const [serviceRes, servicesRes] = await Promise.all([
              apiClient.getService(Number(params.id)),
              apiClient.getServices()
            ]);
            return {
              service: serviceRes.data || serviceRes,
              services: servicesRes.data || servicesRes
            };
          } catch (e) {
            throw new Response("Service not found", { status: 404 });
          }
        }
      },
      {
        path: "/checkout",
        element: <CheckoutPage />
      },

      // Auth Routes (Restricted for authenticated users)
      {
        element: <PublicRoute />,
        children: [
          { path: "/login", element: <LoginPage /> },
          { path: "/register", element: <RegisterPage /> },
        ]
      },

      // Client Routes
      {
        element: <PrivateRoute />,
        children: [
          {
            path: "/client/dashboard",
            element: <ClientDashboard />,
            loader: async () => {
              try {
                const dashboard = await apiClient.getUserDashboard();
                return { dashboard: dashboard.data || dashboard };
              } catch (e) {
                throw new Response("Failed to load dashboard", { status: 500 });
              }
            }
          },
          {
            path: "/client/orders",
            element: <ClientOrders />,
            loader: async () => {
              try {
                const res = await apiClient.getMyOrders();
                return { orders: res.data || res };
              } catch (e) {
                throw new Response("Failed to load orders", { status: 500 });
              }
            }
          },
          {
            path: "/client/new-order",
            element: <ClientNewOrder />,
            loader: async () => {
              try {
                const res = await apiClient.getServices();
                return { services: res.data || res };
              } catch (e) {
                throw new Response("Failed to load services", { status: 500 });
              }
            }
          },
          {
            path: "/client/profile",
            element: <ClientProfile />,
            loader: async () => {
              try {
                const res = await apiClient.getUserDashboard();
                return { dashboard: res.data || res };
              } catch (e) {
                throw new Response("Failed to load profile", { status: 500 });
              }
            }
          },
        ]
      },

      // Admin Dashboard Routes
      {
        element: <PrivateRoute adminOnly={true} />,
        children: [
          {
            path: "/admin/dashboard",
            element: <AdminDashboard />,
            loader: async () => {
              try {
                const dashboard = await apiClient.getAdminDashboard();
                return { dashboard: dashboard.data || dashboard };
              } catch (e) {
                throw new Response("Failed to load dashboard", { status: 500 });
              }
            }
          },
          {
            path: "/admin/orders",
            element: <AdminOrders />,
            loader: async () => {
              try {
                const res = await apiClient.getAdminOrdersList();
                return { orders: res.data || res };
              } catch (e) {
                throw new Response("Failed to load orders", { status: 500 });
              }
            }
          },
          {
            path: "/admin/services",
            element: <AdminServices />,
            loader: async () => {
              try {
                const res = await apiClient.getServices();
                return { services: res.data || res };
              } catch (e) {
                throw new Response("Failed to load services", { status: 500 });
              }
            }
          },
          {
            path: "/admin/users",
            element: <AdminUsers />,
            loader: async () => {
              try {
                const res = await apiClient.getAdminUsersList();
                return { users: res.data || res };
              } catch (e) {
                throw new Response("Failed to load users", { status: 500 });
              }
            }
          },
          {
            path: "/admin/payments",
            element: <AdminPayments />,
            loader: async () => {
              try {
                const [paymentsRes, usersRes] = await Promise.all([
                  apiClient.getAdminPaymentsList(),
                  apiClient.getAdminUsersList(),
                ]);
                return {
                  payments: paymentsRes.data || paymentsRes,
                  users: usersRes.data || usersRes
                };
              } catch (e) {
                throw new Response("Failed to load payments", { status: 500 });
              }
            }
          },
          {
            path: "/admin/profile",
            element: <AdminProfile />
          },
        ]
      },

      // Fallback
      { path: "*", element: <NotFound /> }
    ]
  }
]);
