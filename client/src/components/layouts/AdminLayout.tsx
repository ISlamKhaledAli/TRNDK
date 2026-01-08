import { ReactNode } from "react";
import AdminSidebar from "../common/AdminSidebar";
import DashboardTopbar from "../common/DashboardTopbar";
import ResponsiveSidebar from "../common/ResponsiveSidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="min-h-screen flex w-full">
      <ResponsiveSidebar isAdmin>
        <AdminSidebar />
      </ResponsiveSidebar>
      <div className="flex-1 flex flex-col bg-background">
        <DashboardTopbar isAdmin />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
