/**
 * client/src/pages/admin/AdminContact.tsx
 * 
 * Standalone dedicated Admin page for the Floating Contact Button.
 * Provides complete control over WhatsApp & Telegram channels, live preview,
 * position, messages, and styling independently of the banners page.
 */

import AdminLayout from "@/components/layouts/AdminLayout";
import AdminContactManager from "@/components/admin/AdminContactManager";
import { MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

const AdminContact = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/50">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-primary/10 text-primary">
                <MessageCircle className="w-6 h-6" />
              </span>
              <span>{isRtl ? "زر التواصل السريع (WhatsApp & Telegram)" : "Floating Contact Button"}</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isRtl
                ? "إدارة وتخصيص زر التواصل العائم في واجهة المتجر والتحكم في توجيهه إلى الواتساب أو التليجرام"
                : "Manage and customize the floating contact widget on the store frontend and configure WhatsApp/Telegram"}
            </p>
          </div>
        </div>

        {/* Manager Component */}
        <AdminContactManager />
      </div>
    </AdminLayout>
  );
};

export default AdminContact;
