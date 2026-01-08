import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Diamond,
  Settings,
  LogOut,
  Megaphone,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Brand from "./Brand";
import { useSidebar } from "@/contexts/SidebarContext";

import { useAuth } from "@/contexts/AuthContext";

interface ClientSidebarProps {
  compact?: boolean;
}

const ClientSidebar = ({ compact = false }: ClientSidebarProps) => {
  const location = useLocation();
  const { t } = useTranslation("client");
  const { logout } = useAuth();
  const { isMobile, closeSidebar } = useSidebar();

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: t("sidebar.dashboard"),
      href: "/client/dashboard",
    },
    { icon: ClipboardList, label: t("sidebar.orders"), href: "/client/orders" },
    { icon: Diamond, label: t("sidebar.services"), href: "/services" },
    {
      icon: Megaphone,
      label: t("sidebar.affiliates"),
      href: "/client/affiliates",
    },
    { icon: Settings, label: t("sidebar.profile"), href: "/client/profile" },
  ];

  // Close sidebar on mobile when a link is clicked
  const handleLinkClick = () => {
    if (isMobile) {
      closeSidebar();
    }
  };

  return (
    <aside className="w-64 bg-sidebar lg:border-e border-slate-200/60 dark:border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 lg:border-b border-slate-200/60 dark:border-slate-800 ms-8 md:ms-12">
        <Brand scale={4} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-auto">
        <p className="px-4 py-2 text-xs font-medium text-sidebar-muted uppercase tracking-wider">
          {t("sidebar.mainMenu")}
        </p>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={handleLinkClick}
              className={`sidebar-item ${
                isActive ? "sidebar-item-active" : ""
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 lg:border-t border-slate-200/60 dark:border-slate-800">
        <button
          onClick={() => {
            logout();
            if (isMobile) {
              closeSidebar();
            }
          }}
          className="
      sidebar-item w-full
      text-destructive
      hover:bg-destructive/10 hover:text-destructive
      focus:bg-destructive/10
      transition-colors

      dark:text-red-400
      dark:hover:bg-red-500/10
      dark:hover:text-red-300
      dark:focus:bg-red-500/10
    "
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">{t("sidebar.logout")}</span>
        </button>
      </div>
    </aside>
  );
};

export default ClientSidebar;
