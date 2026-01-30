/**
 * client/src/pages/admin/AdminProfile.tsx
 * 
 * Admin profile management page.
 * Allows admins to view and edit their profile information and change password.
 */

import AdminLayout from "@/components/layouts/AdminLayout";
import { User, Mail, Phone, Lock, Save, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { apiClient } from "@/services/api";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const AdminProfile = () => {
  const { user, updateUser } = useAuth();
  const { t, i18n } = useTranslation(["admin", "common"]);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Sync state with user when it loads
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        email: user.email,
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const { data } = await apiClient.updateProfile(profileData);
      updateUser(data);
      toast.success(t("profile.updateSuccess"));
    } catch (error: any) {
      toast.error(error.message || t("profile.updateError"));
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error(t("profile.passwordMatchError"));
    }

    setIsUpdatingPassword(true);
    try {
      await apiClient.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success(t("profile.passwordUpdateSuccess"));
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.message || t("profile.passwordUpdateError"));
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">{t("profile.title")}</h1>
        <p className="text-muted-foreground">{t("profile.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Info */}
          <form onSubmit={handleProfileSubmit} className="bg-card rounded-xl border border-border p-6 card-shadow">
            <h2 className="text-lg font-bold text-foreground mb-4 text-start">{t("profile.personalInfo")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-start">
                <label className="block text-sm font-medium text-foreground mb-2">{t("profile.fullName")}</label>
                <div className="relative">
                  <User className="absolute inset-inline-end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    required
                    className="w-full bg-secondary text-foreground rounded-lg pe-10 ps-4 py-3 text-sm border border-border focus:outline-none focus:border-primary" 
                  />
                </div>
              </div>
              <div className="text-start">
                <label className="block text-sm font-medium text-foreground mb-2">{t("profile.email")}</label>
                <div className="relative">
                  <Mail className="absolute inset-inline-end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="email" 
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    required
                    className="w-full bg-secondary text-foreground rounded-lg pe-10 ps-4 py-3 text-sm border border-border focus:outline-none focus:border-primary" 
                  />
                </div>
              </div>
              <div className="text-start">
                <label className="block text-sm font-medium text-foreground mb-2">{t("profile.phone")}</label>
                <div className="relative">
                  <Phone className="absolute inset-inline-end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="tel" 
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder={t("profile.phonePlaceholder")} 
                    dir="ltr" 
                    className="w-full bg-secondary text-foreground rounded-lg pe-10 ps-4 py-3 text-sm border border-border focus:outline-none focus:border-primary text-left" 
                  />
                </div>
              </div>
            </div>
            <button 
              type="submit"
              disabled={isUpdatingProfile}
              className="mt-4 bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isUpdatingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {t("common:buttons.save")}
            </button>
          </form>

          {/* Change Password */}
          <form onSubmit={handlePasswordSubmit} className="bg-card rounded-xl border border-border p-6 card-shadow">
            <h2 className="text-lg font-bold text-foreground mb-4 text-start">{t("profile.changePassword")}</h2>
            <div className="space-y-4">
              <div className="text-start">
                <label className="block text-sm font-medium text-foreground mb-2">{t("profile.currentPassword")}</label>
                <div className="relative">
                  <Lock className="absolute inset-inline-end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="password" 
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                    className="w-full bg-secondary text-foreground rounded-lg pe-10 ps-4 py-3 text-sm border border-border focus:outline-none focus:border-primary" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-start">
                  <label className="block text-sm font-medium text-foreground mb-2">{t("profile.newPassword")}</label>
                  <div className="relative">
                    <Lock className="absolute inset-inline-end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="password" 
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required
                      className="w-full bg-secondary text-foreground rounded-lg pe-10 ps-4 py-3 text-sm border border-border focus:outline-none focus:border-primary" 
                    />
                  </div>
                </div>
                <div className="text-start">
                  <label className="block text-sm font-medium text-foreground mb-2">{t("profile.confirmPassword")}</label>
                  <div className="relative">
                    <Lock className="absolute inset-inline-end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="password" 
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      required
                      className="w-full bg-secondary text-foreground rounded-lg pe-10 ps-4 py-3 text-sm border border-border focus:outline-none focus:border-primary" 
                    />
                  </div>
                </div>
              </div>
            </div>
            <button 
              type="submit"
              disabled={isUpdatingPassword}
              className="mt-4 bg-secondary text-foreground px-6 py-2 rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors border border-border flex items-center gap-2 disabled:opacity-50"
            >
              {isUpdatingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
              {t("profile.updatePassword")}
            </button>
          </form>
        </div>

        {/* Admin Card */}
        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6 card-shadow">
            <div className="text-center mb-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <span className="text-2xl font-bold text-primary">{user?.name?.charAt(0) || 'A'}</span>
              </div>
              <h3 className="font-bold text-foreground">{user?.name}</h3>
              <p className="text-sm text-muted-foreground">{t("common:userMenu.admin")}</p>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between p-3 bg-secondary/50 rounded-lg">
                <span className="text-muted-foreground">{t("profile.registrationDate")}</span>
                <span className="font-bold text-foreground">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US') : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-secondary/50 rounded-lg">
                <span className="text-muted-foreground">{t("profile.permissions")}</span>
                <span className="font-bold text-foreground">{t("profile.fullPermissions")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProfile;
