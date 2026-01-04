import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface PrivateRouteProps {
  adminOnly?: boolean;
}

const PrivateRoute = ({ adminOnly = false }: PrivateRouteProps) => {
  const { user, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    // simpler loading state or return null
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin()) {
    return <Navigate to="/client/dashboard" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
