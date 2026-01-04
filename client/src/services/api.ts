const API_BASE = '/api/v1';

export const apiClient = {
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },

  async logout() {
    const res = await fetch(`${API_BASE}/logout`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Logout failed');
    return res.json();
  },


  async getProfile() {
    const res = await fetch(`${API_BASE}/profile`);
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  },

  async updateProfile(data: { name?: string; email?: string; phone?: string }) {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to update profile');
    }
    return res.json();
  },

  async updatePassword(passwordData: { currentPassword: string; newPassword: string }) {
    const res = await fetch(`${API_BASE}/profile/password`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(passwordData),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to update password');
    }
    return res.json();
  },

  async register(name: string, email: string, password: string, role: string = 'customer') {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });
    if (!res.ok) throw new Error('Registration failed');
    return res.json();
  },

  async getServices(category?: string) {
    // Add timestamp to prevent any caching
    const timestamp = new Date().getTime();
    let url = `${API_BASE}/services?_t=${timestamp}`;
    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch services');
    return res.json();
  },

  async getServiceCategories() {
    const res = await fetch(`${API_BASE}/services/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async getService(id: number) {
    const res = await fetch(`${API_BASE}/services/${id}`);
    if (!res.ok) throw new Error('Service not found');
    return res.json();
  },

  async createOrder(order: any) {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (!res.ok) throw new Error('Failed to create order');
    return res.json();
  },

  async getMyOrders() {
    const res = await fetch(`${API_BASE}/orders/my`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },



  async createService(service: { name: string; description: string; price: number; category?: string; duration?: string; imageUrl?: string; nameEn?: string; descriptionEn?: string }) {
    const res = await fetch(`${API_BASE}/admin/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(service),
    });
    if (!res.ok) throw new Error('Failed to create service');
    return res.json();
  },

  async updateService(id: number, service: Partial<{ name: string; description: string; price: number; category?: string; duration?: string; imageUrl?: string; isActive?: boolean; nameEn?: string; descriptionEn?: string }>) {
    const res = await fetch(`${API_BASE}/admin/services/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(service),
    });
    if (!res.ok) throw new Error('Failed to update service');
    return res.json();
  },

  async deleteService(id: number) {
    const res = await fetch(`${API_BASE}/admin/services/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete service');
    return res.json();
  },

  async deleteOrder(id: number) {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete order');
    return res.json();
  },

  async getAdminOrdersList() {
    const res = await fetch(`${API_BASE}/admin/orders`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async updateServiceStatus(id: number, isActive: boolean) {
    const res = await fetch(`${API_BASE}/admin/services/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    });
    if (!res.ok) throw new Error('Failed to update service status');
    return res.json();
  },

  async updateOrderStatusAdmin(id: number, status: string) {
    const res = await fetch(`${API_BASE}/admin/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update order status');
    return res.json();
  },

  async getAdminUsersList() {
    const res = await fetch(`${API_BASE}/admin/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  async updateUserStatus(id: number, status: string) {
    const res = await fetch(`${API_BASE}/admin/users/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update user status');
    return res.json();
  },

  async updateUserVipStatus(id: number, isVip: boolean) {
    const res = await fetch(`${API_BASE}/admin/users/${id}/vip`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isVip }),
    });
    if (!res.ok) throw new Error('Failed to update user VIP status');
    return res.json();
  },

  async getAdminPaymentsList() {
    const res = await fetch(`${API_BASE}/admin/payments`);
    if (!res.ok) throw new Error('Failed to fetch payments');
    return res.json();
  },

  async updatePaymentStatus(id: number, status: string) {
    const res = await fetch(`${API_BASE}/admin/payments/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update payment status');
    return res.json();
  },

  async getNotifications() {
    const res = await fetch(`${API_BASE}/notifications`);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  async markNotificationRead(id: number) {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Failed to mark notification as read');
    return res.json();
  },

  async markAllNotificationsRead() {
    const res = await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Failed to mark all notifications as read');
    return res.json();
  },

  async getUserDashboard() {
    const res = await fetch(`${API_BASE}/dashboard/user`);
    if (!res.ok) throw new Error('Failed to fetch user dashboard');
    return res.json();
  },

  async getAdminDashboard() {
    const res = await fetch(`${API_BASE}/dashboard/admin`);
    if (!res.ok) throw new Error('Failed to fetch admin dashboard');
    return res.json();
  },

  async createReview(review: { serviceId: number; rating: number; comment?: string }) {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to submit review');
    }
    return res.json();
  },

  async getReviews(serviceId: number) {
    const res = await fetch(`${API_BASE}/services/${serviceId}/reviews`);
    if (!res.ok) throw new Error('Failed to fetch reviews');
    return res.json();
  },

  async getSetting(key: string) {
    const res = await fetch(`${API_BASE}/settings/${key}`);
    if (!res.ok) throw new Error('Failed to fetch setting');
    return res.json();
  },

  async updateSetting(key: string, value: string | number) {
    const res = await fetch(`${API_BASE}/admin/settings/${key}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
    if (!res.ok) throw new Error('Failed to update setting');
    return res.json();
  },
};
