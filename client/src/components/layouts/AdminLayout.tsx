import { ReactNode } from "react";
import AdminSidebar from "../common/AdminSidebar";
import DashboardTopbar from "../common/DashboardTopbar";
import ResponsiveSidebar from "../common/ResponsiveSidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="min-h-screen flex w-full max-w-full overflow-x-hidden">
      <ResponsiveSidebar isAdmin>
        <AdminSidebar />
      </ResponsiveSidebar>
      <div className="flex-1 min-w-0 flex flex-col bg-background max-w-full overflow-x-hidden">
        <DashboardTopbar isAdmin />
        <main className="flex-1 p-6 overflow-y-auto overflow-x-hidden max-w-full">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
