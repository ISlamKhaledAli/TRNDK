import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Diamond,
  Settings,
  LogOut,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const ClientSidebar = () => {
  const location = useLocation();
  const { t } = useTranslation("client");

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: t("sidebar.dashboard"),
      href: "/client/dashboard",
    },
    { icon: ClipboardList, label: t("sidebar.orders"), href: "/client/orders" },
    { icon: Diamond, label: t("sidebar.services"), href: "/services" },
    { icon: Settings, label: t("sidebar.profile"), href: "/client/profile" },
  ];

  return (
    <aside className="w-64 bg-sidebar border-l border-slate-200/60 dark:border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200/60 dark:border-slate-800">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">س</span>
          </div>
          <span className="font-bold text-xl">STAALKR</span>
        </Link>
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
              className={`sidebar-item ${isActive ? "sidebar-item-active" : ""}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={() => {
            // TODO: Clear auth token/session
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
          className="sidebar-item w-full text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">{t("sidebar.logout")}</span>
        </button>
      </div>
    </aside>
  );
};

export default ClientSidebar;
