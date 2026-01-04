import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  Users,
  CreditCard,
  LogOut,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Brand from "./Brand";

import { useAuth } from "@/contexts/AuthContext";

const AdminSidebar = () => {
  const location = useLocation();
  const { t } = useTranslation("admin");
  const { logout } = useAuth();

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: t("sidebar.dashboard"),
      href: "/admin/dashboard",
    },
    { icon: ClipboardList, label: t("sidebar.orders"), href: "/admin/orders" },
    { icon: Package, label: t("sidebar.services"), href: "/admin/services" },
    { icon: Users, label: t("sidebar.users"), href: "/admin/users" },
    { icon: CreditCard, label: t("sidebar.payments"), href: "/admin/payments" },
  ];

  return (
    <aside className="w-64 bg-sidebar border-e border-slate-200/60 dark:border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200/60 dark:border-slate-800 ms-8 md:ms-12">
        <Brand scale={4} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-auto">
        <p className="px-4 py-2 text-xs font-medium text-sidebar-muted uppercase tracking-wider">
          {t("sidebar.management")}
        </p>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`sidebar-item ${isActive ? "sidebar-item-active" : ""}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-200/60 dark:border-slate-800">
        <button
          onClick={() => logout()}
          className="sidebar-item w-full text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">{t("sidebar.logout")}</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
