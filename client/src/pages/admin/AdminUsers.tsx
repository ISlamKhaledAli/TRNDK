/**
 * client/src/pages/admin/AdminUsers.tsx
 * 
 * Admin users management page.
 * Displays all users in a table with search, filtering, and pagination.
 * Allows admins to view user details, update status, and toggle VIP status.
 */

import AdminLayout from "@/components/layouts/AdminLayout";
import { Eye, ChevronLeft, ChevronRight, Crown, X } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "@/services/api";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useLoaderData, useRevalidator } from "react-router-dom";
import { useSocket } from "@/hooks/useSocket";

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  status: 'active' | 'suspended';
  isVip: boolean;
  createdAt: string;
}

const AdminUsers = () => {
  const { users: initialUsers } = useLoaderData() as { users: User[] };
  const { revalidate } = useRevalidator();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [statusFilter, setStatusFilter] = useState('all');
  const [vipFilter, setVipFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { t, i18n } = useTranslation(["admin", "common"]);
  const { on, off } = useSocket();

  useEffect(() => {
    const handleNewUser = (user: any) => {
      console.log("[AdminUsers] New user registered via socket, refreshing list");
      
      // Show toast
      toast.info(t("users.notifications.newUser", { defaultValue: "New User Registered!" }), {
        description: `${user.name} (${user.email})`,
      });

      // Refresh data
      revalidate();
    };

    on("NEW_USER", handleNewUser);
    return () => off("NEW_USER");
  }, [on, off, revalidate, t]);

  // Sync state if loader data changes
  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const handleStatusChange = async (userId: number, newStatus: string) => {
    try {
      await apiClient.updateUserStatus(userId, newStatus);
      toast.success(t("users.updateSuccess"));
      revalidate();
    } catch (error) {
      toast.error(t("users.updateError"));
      console.error('Error:', error);
    }
  };

  const handleVipToggle = async (userId: number, currentVip: boolean) => {
    try {
      await apiClient.updateUserVipStatus(userId, !currentVip);
      toast.success(t("users.vipSuccess"));
      revalidate();
    } catch (error) {
      toast.error(t("users.vipError"));
      console.error('Error:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesVip = vipFilter === 'all' || (vipFilter === 'vip' ? user.isVip : !user.isVip);
    
    return matchesStatus && matchesVip;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    vip: users.filter(u => u.isVip).length,
    suspended: users.filter(u => u.status === 'suspended').length,
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{t("users.title")}</h1>
          <p className="text-muted-foreground">{t("users.subtitle")}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-lg border border-border p-4 text-center card-shadow">
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          <p className="text-sm text-muted-foreground">{t("users.stats.total")}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center card-shadow">
          <p className="text-2xl font-bold text-success">{stats.active}</p>
          <p className="text-sm text-muted-foreground">{t("users.stats.active")}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center card-shadow">
          <p className="text-2xl font-bold text-warning">{stats.vip}</p>
          <p className="text-sm text-muted-foreground">{t("users.stats.vip")}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center card-shadow">
          <p className="text-2xl font-bold text-destructive">{stats.suspended}</p>
          <p className="text-sm text-muted-foreground">{t("users.stats.suspended")}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4 mb-6 card-shadow">
        <div className="flex flex-col md:flex-row gap-4">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-secondary text-foreground rounded-lg px-4 py-2 text-sm border border-border focus:outline-none focus:border-primary"
          >
            <option value="all">{t("orders.statusAll")}</option>
            <option value="active">{t("users.stats.active")}</option>
            <option value="suspended">{t("users.stats.suspended")}</option>
          </select>
          <select 
            value={vipFilter}
            onChange={(e) => setVipFilter(e.target.value)}
            className="bg-secondary text-foreground rounded-lg px-4 py-2 text-sm border border-border focus:outline-none focus:border-primary"
          >
            <option value="all">{t("common.loading") === "جاري التحميل..." ? 'جميع المستويات' : 'All Levels'}</option>
            <option value="vip">{t("users.details.vip")}</option>
            <option value="normal">{t("users.details.normal")}</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden card-shadow">
        <div className="overflow-x-auto">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">{t("users.noUsers")}</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-start text-xs font-medium text-muted-foreground p-4">{t("users.id")}</th>
                  <th className="text-start text-xs font-medium text-muted-foreground p-4">{t("users.user")}</th>
                  <th className="text-start text-xs font-medium text-muted-foreground p-4">{t("users.phone")}</th>
                  <th className="text-start text-xs font-medium text-muted-foreground p-4">{t("users.registrationDate")}</th>
                  <th className="text-start text-xs font-medium text-muted-foreground p-4">{t("common:status")}</th>
                  <th className="text-start text-xs font-medium text-muted-foreground p-4">{t("common:actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                    <td className="p-4 text-sm text-muted-foreground">{user.id}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">{user.name[0]}</span>
                        </div>
                        <div className="text-start">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground">{user.name}</p>
                            {user.isVip && <Crown className="w-4 h-4 text-warning" />}
                          </div>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-foreground" dir="ltr">{user.phone || '-'}</td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US')}
                    </td>
                    <td className="p-4">
                      <select
                        value={user.status}
                        onChange={(e) => handleStatusChange(user.id, e.target.value)}
                        className={`text-xs rounded-full px-2 py-1 border cursor-pointer focus:outline-none ${
                          user.status === "active" 
                            ? "bg-success/10 text-success border-success/20" 
                            : "bg-destructive/10 text-destructive border-destructive/20"
                        }`}
                      >
                        <option value="active">{t("users.stats.active")}</option>
                        <option value="suspended">{t("users.stats.suspended")}</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleVipToggle(user.id, user.isVip)}
                          className="p-2 rounded-lg hover:bg-warning/10 transition-colors" 
                          title={user.isVip ? t("users.details.removeVip") : t("users.details.makeVip")}
                        >
                          <Crown className={`w-4 h-4 ${user.isVip ? 'text-warning' : 'text-muted-foreground'}`} />
                        </button>
                        <button 
                          onClick={() => setSelectedUser(user)}
                          className="p-2 rounded-lg hover:bg-secondary transition-colors" 
                          title={t("common:view")}
                        >
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
             {t("users.pagination", { count: filteredUsers.length, total: users.length })}
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors disabled:opacity-50" disabled>
              <ChevronRight className="w-4 h-4 text-foreground" />
            </button>
            <button className="w-8 h-8 rounded-lg bg-primary text-primary-foreground text-sm font-medium">1</button>
            <button className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors">
              <ChevronLeft className="w-4 h-4 text-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">{t("users.details.title")}</h2>
              <button 
                onClick={() => setSelectedUser(null)}
                className="p-1 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              {/* User Avatar */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-medium text-primary">{selectedUser.name[0]}</span>
                </div>
              </div>

              {/* Basic Info */}
              <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
                <div className="text-start">
                  <p className="text-xs font-medium text-muted-foreground mb-1">{t("users.details.name")}</p>
                  <p className="text-sm font-medium text-foreground">{selectedUser.name}</p>
                </div>
                <div className="text-start">
                  <p className="text-xs font-medium text-muted-foreground mb-1">{t("users.details.email")}</p>
                  <p className="text-sm text-foreground">{selectedUser.email}</p>
                </div>
                {selectedUser.phone && (
                  <div className="text-start">
                    <p className="text-xs font-medium text-muted-foreground mb-1">{t("users.phone")}</p>
                    <p className="text-sm text-foreground" dir="ltr">{selectedUser.phone}</p>
                  </div>
                )}
              </div>

              {/* Account Status */}
              <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
                <div className="text-start">
                  <p className="text-xs font-medium text-muted-foreground mb-1">{t("users.details.status")}</p>
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                    selectedUser.status === "active" 
                      ? "bg-success/10 text-success" 
                      : "bg-destructive/10 text-destructive"
                  }`}>
                    {selectedUser.status === "active" ? t("users.stats.active") : t("users.stats.suspended")}
                  </span>
                </div>
                <div className="text-start">
                  <p className="text-xs font-medium text-muted-foreground mb-1">{t("users.details.membership")}</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                    selectedUser.isVip 
                      ? "bg-warning/10 text-warning" 
                      : "bg-secondary text-muted-foreground"
                  }`}>
                    {selectedUser.isVip ? (
                      <>
                        <Crown className="w-3 h-3" />
                        {t("users.details.vip")}
                      </>
                    ) : (
                      t("users.details.normal")
                    )}
                  </span>
                </div>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4 space-y-3 text-start">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">{t("users.registrationDate")}</p>
                  <p className="text-sm text-foreground">
                    {new Date(selectedUser.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US')}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => {
                    handleStatusChange(selectedUser.id, selectedUser.status === 'active' ? 'suspended' : 'active');
                    setSelectedUser(null);
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedUser.status === 'active'
                      ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                      : 'bg-success/10 text-success hover:bg-success/20'
                  }`}
                >
                  {selectedUser.status === 'active' ? t("users.details.suspend") : t("users.details.activate")}
                </button>
                <button 
                  onClick={() => {
                    handleVipToggle(selectedUser.id, selectedUser.isVip);
                    setSelectedUser(null);
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedUser.isVip
                      ? 'bg-warning/10 text-warning hover:bg-warning/20'
                      : 'bg-primary/10 text-primary hover:bg-primary/20'
                  }`}
                >
                  {selectedUser.isVip ? t("users.details.removeVip") : t("users.details.makeVip")}
                </button>
              </div>

              <button 
                onClick={() => setSelectedUser(null)}
                className="w-full px-4 py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors text-sm font-medium"
              >
                {t("common:close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUsers;
