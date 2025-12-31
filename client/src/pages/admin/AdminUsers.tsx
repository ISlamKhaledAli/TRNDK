import AdminLayout from "@/components/layouts/AdminLayout";
import { Search, UserPlus, Eye, Edit, Ban, ChevronLeft, ChevronRight, Crown, X } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  status: 'active' | 'suspended';
  isVip: boolean;
  balance: number;
  createdAt: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vipFilter, setVipFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      const response = await apiClient.getAdminUsersList();
      const userData = response.data || response;
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (error) {
      toast.error('Failed to load users');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusChange = async (userId: number, newStatus: string) => {
    try {
      await apiClient.updateUserStatus(userId, newStatus);
      toast.success('User status updated successfully');
      await fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
      console.error('Error:', error);
    }
  };

  const handleVipToggle = async (userId: number, currentVip: boolean) => {
    try {
      await apiClient.updateUserVipStatus(userId, !currentVip);
      toast.success(currentVip ? 'VIP status removed' : 'User promoted to VIP');
      await fetchUsers();
    } catch (error) {
      toast.error('Failed to update VIP status');
      console.error('Error:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone || '').includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesVip = vipFilter === 'all' || (vipFilter === 'vip' ? user.isVip : !user.isVip);
    
    return matchesSearch && matchesStatus && matchesVip;
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
          <h1 className="text-2xl font-bold text-foreground mb-2">إدارة المستخدمين</h1>
          <p className="text-muted-foreground">عرض وإدارة حسابات المستخدمين</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <UserPlus className="w-4 h-4" />
          إضافة مستخدم
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-lg border border-border p-4 text-center card-shadow">
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          <p className="text-sm text-muted-foreground">إجمالي المستخدمين</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center card-shadow">
          <p className="text-2xl font-bold text-success">{stats.active}</p>
          <p className="text-sm text-muted-foreground">نشط</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center card-shadow">
          <p className="text-2xl font-bold text-warning">{stats.vip}</p>
          <p className="text-sm text-muted-foreground">VIP</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center card-shadow">
          <p className="text-2xl font-bold text-destructive">{stats.suspended}</p>
          <p className="text-sm text-muted-foreground">موقوف</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4 mb-6 card-shadow">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="ابحث بالاسم، البريد، أو رقم الجوال..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg pr-10 pl-4 py-2 text-sm border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-secondary text-foreground rounded-lg px-4 py-2 text-sm border border-border focus:outline-none focus:border-primary"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="suspended">موقوف</option>
          </select>
          <select 
            value={vipFilter}
            onChange={(e) => setVipFilter(e.target.value)}
            className="bg-secondary text-foreground rounded-lg px-4 py-2 text-sm border border-border focus:outline-none focus:border-primary"
          >
            <option value="all">جميع المستويات</option>
            <option value="vip">VIP</option>
            <option value="normal">عادي</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden card-shadow">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">لا توجد مستخدمين</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">#</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">المستخدم</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">رقم الجوال</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">الرصيد</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">تاريخ التسجيل</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">الحالة</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">إجراءات</th>
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
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground">{user.name}</p>
                            {user.isVip && <Crown className="w-4 h-4 text-warning" />}
                          </div>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-foreground" dir="ltr">{user.phone || '-'}</td>
                    <td className="p-4 text-sm font-medium text-foreground">${(user.balance / 100).toFixed(2)}</td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString('ar-SA')}
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
                        <option value="active">نشط</option>
                        <option value="suspended">موقوف</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleVipToggle(user.id, user.isVip)}
                          className="p-2 rounded-lg hover:bg-warning/10 transition-colors" 
                          title={user.isVip ? 'Remove VIP' : 'Make VIP'}
                        >
                          <Crown className={`w-4 h-4 ${user.isVip ? 'text-warning' : 'text-muted-foreground'}`} />
                        </button>
                        <button 
                          onClick={() => setSelectedUser(user)}
                          className="p-2 rounded-lg hover:bg-secondary transition-colors" 
                          title="عرض التفاصيل"
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
          <p className="text-sm text-muted-foreground">عرض {filteredUsers.length} من {users.length} مستخدم</p>
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
              <h2 className="text-xl font-bold text-foreground">تفاصيل المستخدم</h2>
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
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">الاسم</p>
                  <p className="text-sm font-medium text-foreground">{selectedUser.name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">البريد الإلكتروني</p>
                  <p className="text-sm text-foreground">{selectedUser.email}</p>
                </div>
                {selectedUser.phone && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">رقم الجوال</p>
                    <p className="text-sm text-foreground" dir="ltr">{selectedUser.phone}</p>
                  </div>
                )}
              </div>

              {/* Account Status */}
              <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">حالة الحساب</p>
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                    selectedUser.status === "active" 
                      ? "bg-success/10 text-success" 
                      : "bg-destructive/10 text-destructive"
                  }`}>
                    {selectedUser.status === "active" ? "نشط" : "موقوف"}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">مستوى العضوية</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                    selectedUser.isVip 
                      ? "bg-warning/10 text-warning" 
                      : "bg-secondary text-muted-foreground"
                  }`}>
                    {selectedUser.isVip ? (
                      <>
                        <Crown className="w-3 h-3" />
                        VIP
                      </>
                    ) : (
                      "عادي"
                    )}
                  </span>
                </div>
              </div>

              {/* Balance Info */}
              <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">الرصيد</p>
                  <p className="text-sm font-medium text-foreground">${(selectedUser.balance / 100).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">تاريخ التسجيل</p>
                  <p className="text-sm text-foreground">{new Date(selectedUser.createdAt).toLocaleDateString('ar-SA')}</p>
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
                  {selectedUser.status === 'active' ? 'إيقاف الحساب' : 'تفعيل الحساب'}
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
                  {selectedUser.isVip ? 'إلغاء VIP' : 'ترقية VIP'}
                </button>
              </div>

              <button 
                onClick={() => setSelectedUser(null)}
                className="w-full px-4 py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors text-sm font-medium"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUsers;
