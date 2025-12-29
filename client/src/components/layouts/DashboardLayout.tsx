import { ReactNode } from "react";
import ClientSidebar from "../common/ClientSidebar";
import DashboardTopbar from "../common/DashboardTopbar";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen flex w-full">
      <ClientSidebar />
      <div className="flex-1 flex flex-col bg-background">
        <DashboardTopbar />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
