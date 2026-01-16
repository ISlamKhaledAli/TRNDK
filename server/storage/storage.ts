/**
 * server/storage/storage.ts
 * 
 * Data storage layer with two implementations:
 * - MemStorage: In-memory storage for development/testing with mock data
 * - DatabaseStorage: Prisma-based MySQL storage for production
 * Provides unified interface for users, services, orders, payments, notifications, reviews, and settings.
 */

import { type User, type InsertUser, type Service, type InsertService, type Order, type InsertOrder, type Payment, type InsertPayment, type Notification, type InsertNotification, type Review, type InsertReview, type Setting, type InsertSetting, type Affiliate, type InsertAffiliate } from "@shared/schema";
import { hashSync } from "bcryptjs";
import { db } from "../config/db";
import { Prisma } from "@prisma/client";
import fs from "fs";
import path from "path";

export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UserDashboardData {
  totalOrders: number;
  ordersByStatus: Record<string, number>;
  totalSpent: number;
  recentOrders: (Order & { serviceName: string })[];
  unreadNotifications: number;
}

export interface AdminDashboardData {
  totalUsers: number;
  totalOrders: number;
  ordersByStatus: Record<string, number>;
  totalRevenue: number;
  recentOrders: (Order & { userName: string; serviceName: string })[];
  recentUsers: User[];
  topServices: { name: string; orders: number; revenue: number }[];
  revenueChange: number;
  ordersChange: number;
  usersChange: number;
  conversionRate: number;
  conversionRateChange: number;
}

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<StorageResult<User>>;
  updateUserStatus(id: number, status: string): Promise<StorageResult<User>>;
  updateUserVipStatus(id: number, isVip: boolean): Promise<StorageResult<User>>;
  updateUser(id: number, updates: Partial<User>): Promise<StorageResult<User>>;
  updateUserPassword(id: number, passwordHash: string): Promise<StorageResult<void>>;
  
  // Services
  getServices(category?: string): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<StorageResult<Service>>;
  updateService(id: number, service: Partial<InsertService>): Promise<StorageResult<Service>>;
  deleteService(id: number): Promise<StorageResult<void>>;
  
  // Orders
  getOrders(userId: number): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<StorageResult<Order>>;
  updateOrderStatus(id: number, status: string): Promise<StorageResult<Order>>;
  deleteOrder(id: number, userId: number): Promise<StorageResult<void>>;

  // Payments
  getAllPayments(): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<StorageResult<Payment>>; 
  updatePaymentStatus(id: number, status: string): Promise<StorageResult<Payment>>;
  getPaymentByTransactionId(transactionId: string): Promise<Payment | undefined>;

  // Admin
  getAdmins(): Promise<User[]>; 

  // Notifications
  getNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<StorageResult<Notification>>;
  markNotificationRead(id: number): Promise<StorageResult<Notification>>;
  markAllNotificationsRead(userId: number): Promise<StorageResult<void>>;

  // Dashboards
  getUserDashboardData(userId: number): Promise<UserDashboardData>;
  getAdminDashboardData(): Promise<AdminDashboardData>;

  // Reviews
  getReviews(serviceId: number): Promise<(Review & { userName: string })[]>;
  createReview(review: InsertReview): Promise<StorageResult<Review>>;
  canUserReview(userId: number, serviceId: number): Promise<boolean>;

  // Settings
  getSetting(key: string): Promise<Setting | undefined>;
  updateSetting(key: string, value: string): Promise<StorageResult<Setting>>;
  
  // Custom
  updateOrderLastNotify(id: number, date: Date): Promise<StorageResult<Order>>;
  updateOrderCommission(id: number, amount: number, status: string): Promise<StorageResult<Order>>;

  // Affiliates
  getAffiliate(id: number): Promise<Affiliate | undefined>;
  getAffiliateByUserId(userId: number): Promise<Affiliate | undefined>;
  getAffiliateByCode(code: string): Promise<Affiliate | undefined>;
  getAllAffiliates(): Promise<(Affiliate & { user: User })[]>;
  createAffiliate(affiliate: InsertAffiliate): Promise<StorageResult<Affiliate>>;
  updateAffiliate(id: number, updates: Partial<Affiliate>): Promise<StorageResult<Affiliate>>;
  requestPayout(affiliateId: number): Promise<StorageResult<void>>;
  payoutAffiliate(affiliateId: number): Promise<StorageResult<void>>;
  getPayoutRequests(): Promise<(Affiliate & { user: User; stats: { requestedEarnings: number } })[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private services: Map<number, Service>;
  private orders: Map<number, Order>;
  private payments: Map<number, Payment>;
  private notifications: Map<number, Notification>;
  private currentUserId: number;
  private currentServiceId: number;
  private currentOrderId: number;
  private currentPaymentId: number;
  private currentNotificationId: number;
  private reviews: Map<number, Review>;
  private affiliates: Map<number, Affiliate>;
  private currentReviewId: number; 
  private currentAffiliateId: number;
  private settings: Map<string, Setting>;

  constructor() {
    this.users = new Map();
    this.services = new Map();
    this.orders = new Map();
    this.payments = new Map();
    this.notifications = new Map();
    this.reviews = new Map();
    this.affiliates = new Map();
    this.settings = new Map();
    
    // Initialize default tax rate
    this.settings.set('taxRate', { key: 'taxRate', value: '15', updatedAt: new Date() });
    this.currentUserId = 1;
    this.currentServiceId = 1;
    this.currentOrderId = 1;
    this.currentPaymentId = 1;
    this.currentNotificationId = 1;
    this.currentReviewId = 1;
    this.currentAffiliateId = 1;

    // Seed mock data
    this.seedData();
  }

  private seedData() {
    // Seed Admin
    this.createUser({
      name: "Islam Khaled",
      email: "admin@example.com",
      password: hashSync("password", 10),
      role: "admin",
    });

    // Seed Customers with extended data
    for (let i = 1; i <= 5; i++) {
      this.createUser({
        name: `Customer ${i}`,
        email: `customer${i}@example.com`,
        password: hashSync("password", 10),
        role: "customer",
        phone: `+966501234${500 + i}`,
        status: i === 3 ? 'suspended' : 'active',
        isVip: i % 2 === 1,
      });
    }

    // Seed Services
    this.createService({
      name: "Instagram Followers",
      nameEn: "Instagram Followers",
      description: "High quality Instagram followers with fast delivery",
      descriptionEn: "High quality Instagram followers with fast delivery",
      price: 500,
      category: "Instagram",
      duration: "1-2 hours",
      imagePath: "https://images.unsplash.com/photo-1611267254323-4db7b39c732c?w=400&h=400&fit=crop",
    });

    this.createService({
      name: "Facebook Page Likes",
      nameEn: "Facebook Page Likes",
      description: "Organic Facebook page likes to boost your social proof",
      descriptionEn: "Organic Facebook page likes to boost your social proof",
      price: 800,
      category: "Facebook",
      duration: "6-12 hours",
      imagePath: "https://images.unsplash.com/photo-1543269865-cbf427ffebad?w=400&h=400&fit=crop",
    });

    this.createService({
      name: "TikTok Views",
      nameEn: "TikTok Views",
      description: "Instant TikTok views for your latest videos",
      descriptionEn: "Instant TikTok views for your latest videos",
      price: 200,
      category: "TikTok",
      duration: "15-30 minutes",
      imagePath: "https://images.unsplash.com/photo-1598128558393-70ff21433be0?w=400&h=400&fit=crop",
    });

    this.createService({
      name: "YouTube Subscribers",
      nameEn: "YouTube Subscribers",
      description: "Real YouTube subscribers to grow your channel",
      descriptionEn: "Real YouTube subscribers to grow your channel",
      price: 1500,
      category: "YouTube",
      duration: "24-48 hours",
      imagePath: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=400&fit=crop",
    });

    // Seed Payments
    const paymentMethods = ['card', 'apple', 'stc', 'bank'];
    const paymentStatuses = ['completed', 'pending', 'failed'];
    for (let i = 1; i <= 8; i++) {
      const now = new Date();
      const paymentId = this.currentPaymentId++;
      const payment: Payment = {
        id: paymentId,
        userId: Math.min(i, 5) + 1,
        orderId: Math.min(i, 3),
        amount: Math.floor(Math.random() * 10000) + 2500,
        method: paymentMethods[i % 4],
        status: paymentStatuses[i % 3],
        transactionId: `TXN-${Date.now()}-${i}`,
        createdAt: new Date(now.getTime() - i * 3600000),
        updatedAt: new Date(now.getTime() - i * 3600000),
      };
      this.payments.set(paymentId, payment);
    }
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.googleId === googleId
    );
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getAdmins(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === 'admin');
  }

  async createUser(insertUser: InsertUser): Promise<StorageResult<User>> {
    if (!insertUser.email || !insertUser.name || !insertUser.password) {
      return { success: false, error: 'Email, name, and password are required' };
    }
    
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      role: insertUser.role || 'customer',
      status: 'active',
      isVip: false,
      phone: null,
      googleId: insertUser.googleId || null
    };
    this.users.set(id, user);
    return { success: true, data: user };
  }

  async updateUserStatus(id: number, status: string): Promise<StorageResult<User>> {
    const user = this.users.get(id);
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    const validStatuses = ['active', 'suspended'];
    if (!validStatuses.includes(status)) {
      return { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` };
    }
    
    const updated = { ...user, status };
    this.users.set(id, updated);
    return { success: true, data: updated };
  }

  async updateUserVipStatus(id: number, isVip: boolean): Promise<StorageResult<User>> {
    const user = this.users.get(id);
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    const updated = { ...user, isVip };
    this.users.set(id, updated);
    return { success: true, data: updated };
  }

  async updateUser(id: number, updates: Partial<User>): Promise<StorageResult<User>> {
    const user = this.users.get(id);
    if (!user) return { success: false, error: 'User not found' };
    
    // Check email uniqueness if email is being updated
    if (updates.email && updates.email !== user.email) {
      const existing = await this.getUserByEmail(updates.email);
      if (existing) return { success: false, error: 'Email already in use' };
    }

    const updated = { ...user, ...updates };
    this.users.set(id, updated);
    return { success: true, data: updated };
  }

  async updateUserPassword(id: number, passwordHash: string): Promise<StorageResult<void>> {
    const user = this.users.get(id);
    if (!user) return { success: false, error: 'User not found' };
    
    user.password = passwordHash;
    this.users.set(id, user);
    return { success: true };
  }

  // Services
  async getServices(category?: string): Promise<Service[]> {
    const allServices = Array.from(this.services.values());
    if (category) {
      return allServices.filter(s => s.category === category);
    }
    return allServices;
  }

  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async createService(insertService: InsertService): Promise<StorageResult<Service>> {
    const id = this.currentServiceId++; 
    const service: Service = { 
      ...insertService, 
      id, 
      nameEn: insertService.nameEn ?? null,
      descriptionEn: insertService.descriptionEn ?? null,
      imagePath: insertService.imagePath ?? null,
      duration: insertService.duration ?? null,
      isActive: insertService.isActive ?? true, 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.services.set(id, service);
    return { success: true, data: service };
  }

  async updateService(id: number, updateData: Partial<InsertService>): Promise<StorageResult<Service>> {
    const service = this.services.get(id);
    if (!service) {
      return { success: false, error: `Service with id ${id} not found` };
    }
    const updatedService: Service = { 
      ...service, 
      ...updateData,
      nameEn: updateData.nameEn === undefined ? service.nameEn : updateData.nameEn,
      descriptionEn: updateData.descriptionEn === undefined ? service.descriptionEn : updateData.descriptionEn,
      updatedAt: new Date() 
    };
    this.services.set(id, updatedService);
    return { success: true, data: updatedService };
  }

  async deleteService(id: number): Promise<StorageResult<void>> {
    const exists = this.services.has(id);
    if (!exists) {
      return { success: false, error: 'Service not found' };
    }
    this.services.delete(id);
    return { success: true };
  }

  // Orders
  async getOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.userId === userId)
      .map(order => {
        const service = this.services.get(order.serviceId);
        return { ...order, service };
      })
      .sort((a, b) => b.id - a.id);
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(o => o.status !== 'pending_payment')
      .sort((a, b) => b.id - a.id);
  }

  // Payments
  async getAllPayments(): Promise<Payment[]> {
    return Array.from(this.payments.values()).sort((a, b) => b.id - a.id);
  }

  async createPayment(insertPayment: InsertPayment): Promise<StorageResult<Payment>> {
    const id = this.currentPaymentId++;
    const now = new Date();
    const payment: Payment = {
      ...insertPayment,
      id,
      transactionId: insertPayment.transactionId ?? `TXN-${now.getTime()}`,
      currency: 'USD',
      createdAt: now,
      updatedAt: now,
      orderId: insertPayment.orderId ?? null,
      status: insertPayment.status ?? 'pending'
    };
    this.payments.set(id, payment);
    return { success: true, data: payment };
  }

  async updatePaymentStatus(id: number, status: string): Promise<StorageResult<Payment>> {
    const payment = this.payments.get(id);
    if (!payment) {
      return { success: false, error: 'Payment not found' };
    }
    
    const validStatuses = ['pending', 'completed', 'failed'];
    if (!validStatuses.includes(status)) {
      return { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` };
    }
    
    const updated = { ...payment, status, updatedAt: new Date() };
    this.payments.set(id, updated);
    return { success: true, data: updated };
  }

  async getPaymentByTransactionId(transactionId: string): Promise<Payment | undefined> {
    return Array.from(this.payments.values()).find(p => p.transactionId === transactionId);
  }

  async createOrder(insertOrder: InsertOrder): Promise<StorageResult<Order>> {
    if (!insertOrder.userId || !insertOrder.serviceId || insertOrder.totalAmount === undefined) {
      return { success: false, error: 'UserId, serviceId, and totalAmount are required' };
    }
    
    const id = this.currentOrderId++;
    const now = new Date();
    const order: Order = { 
      ...insertOrder, 
      id, 
      createdAt: now, 
      updatedAt: now,
      currency: 'USD',
      status: insertOrder.status || 'pending',
      details: insertOrder.details ?? null
    };
    this.orders.set(id, order);
    return { success: true, data: order };
  }

  async updateOrderStatus(id: number, status: string): Promise<StorageResult<Order>> {
    const order = this.orders.get(id);
    if (!order) {
      return { success: false, error: 'Order not found' };
    }
    
     const validStatuses = ['pending_payment', 'pending', 'confirmed', 'processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` };
    }
    
    // Auto-approve commission if completed
    let commissionStatus = order.commissionStatus;
    if (status === 'completed' && order.affiliateId && order.commissionStatus === 'pending') {
      commissionStatus = 'approved';
    } else if (status === 'cancelled' && order.affiliateId) {
      commissionStatus = 'cancelled';
    }

    const updatedOrder = { ...order, status, commissionStatus, updatedAt: new Date() };
    this.orders.set(id, updatedOrder);
    return { success: true, data: updatedOrder };
  }

  async payoutAffiliate(affiliateId: number): Promise<StorageResult<void>> {
    const orders = Array.from(this.orders.values()).filter(o => o.affiliateId === affiliateId && o.commissionStatus === 'requested');
    
    for (const order of orders) {
      this.orders.set(order.id, { ...order, commissionStatus: 'paid', updatedAt: new Date() });
    }
    
    return { success: true, data: undefined };
  }

  async requestPayout(affiliateId: number): Promise<StorageResult<void>> {
    const affiliate = this.affiliates.get(affiliateId);
    if (!affiliate) return { success: false, error: "Affiliate not found" };

    const approvedOrders = Array.from(this.orders.values()).filter(o => o.affiliateId === affiliateId && o.commissionStatus === 'approved');
    const totalApproved = approvedOrders.reduce((sum, o) => sum + (o.commissionAmount || 0), 0);

    if (totalApproved < 2500) {
      return { success: false, error: "Minimum withdrawal amount is $25.00" };
    }

    for (const order of approvedOrders) {
      this.orders.set(order.id, { ...order, commissionStatus: 'requested', updatedAt: new Date() });
    }

    return { success: true, data: undefined };
  }

  async getPayoutRequests(): Promise<(Affiliate & { user: User; stats: { requestedEarnings: number } })[]> {
    const result: (Affiliate & { user: User; stats: { requestedEarnings: number } })[] = [];
    
    for (const affiliate of Array.from(this.affiliates.values())) {
      const user = this.users.get(affiliate.userId);
      if (!user) continue;

      const requestedOrders = Array.from(this.orders.values()).filter(o => o.affiliateId === affiliate.id && o.commissionStatus === 'requested');
      const requestedEarnings = requestedOrders.reduce((sum, o) => sum + (o.commissionAmount || 0), 0);

      if (requestedEarnings > 0) {
        result.push({
          ...affiliate,
          user,
          stats: { requestedEarnings }
        });
      }
    }

    return result;
  }

  async deleteOrder(id: number, userId: number): Promise<StorageResult<void>> {
    const order = this.orders.get(id);
    if (!order) {
      return { success: false, error: 'Order not found' };
    }
    
    // Ownership check - users can only delete their own orders
    if (order.userId !== userId) {
      return { success: false, error: 'Unauthorized: You can only delete your own orders' };
    }
    
    this.orders.delete(id);
    return { success: true };
  }

  // Notifications
  async getNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createNotification(insertNotification: InsertNotification): Promise<StorageResult<Notification>> {
    const id = this.currentNotificationId++;
    const notification: Notification = {
      ...insertNotification,
      id,
      isRead: false,
      createdAt: new Date(),
      orderId: insertNotification.orderId ?? null,
    };
    this.notifications.set(id, notification);
    return { success: true, data: notification };
  }

  async markNotificationRead(id: number): Promise<StorageResult<Notification>> {
    const notification = this.notifications.get(id);
    if (!notification) {
      return { success: false, error: 'Notification not found' };
    }
    const updated = { ...notification, isRead: true };
    this.notifications.set(id, updated);
    return { success: true, data: updated };
  }

  async markAllNotificationsRead(userId: number): Promise<StorageResult<void>> {
    Array.from(this.notifications.entries()).forEach(([id, notification]) => {
      if (notification.userId === userId && !notification.isRead) {
        this.notifications.set(id, { ...notification, isRead: true });
      }
    });
    return { success: true };
  }

  // Dashboards
  async getUserDashboardData(userId: number): Promise<UserDashboardData> {
    const userOrders = await this.getOrders(userId);
    const notifications = await this.getNotifications(userId);

    // Stats
    const totalOrders = userOrders.length;
    
    const ordersByStatus: Record<string, number> = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      completed: 0,
      cancelled: 0,
    };
    
    let totalSpent = 0;

    userOrders.forEach(order => {
      if (ordersByStatus[order.status] !== undefined) {
        ordersByStatus[order.status]++;
      }
      if (order.status !== 'cancelled' && order.status !== 'pending_payment') {
         totalSpent += order.totalAmount;
      }
    });

    // Recent Orders (Last 5)
    const sortedOrders = [...userOrders].sort((a, b) => b.id - a.id).slice(0, 5);
    
    const recentOrders = sortedOrders.map(order => {
      const service = this.services.get(order.serviceId);
      return {
        ...order,
        serviceName: service ? service.name : 'Unknown Service'
      };
    });

    const unreadNotifications = notifications.filter(n => !n.isRead).length;

    return {
      totalOrders,
      ordersByStatus,
      totalSpent,
      recentOrders,
      unreadNotifications
    };
  }

  async getAdminDashboardData(): Promise<AdminDashboardData> {
    const allOrders = await this.getAllOrders();
    const allUsers = await this.getAllUsers();
    
    // Stats
    const totalUsers = allUsers.filter(u => u.role !== 'admin').length;
    const totalOrders = allOrders.length;
    
    const ordersByStatus: Record<string, number> = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      completed: 0,
      cancelled: 0,
    };

    let totalRevenue = 0;
    const serviceRevenueMap = new Map<number, { orders: number, revenue: number }>();

    allOrders.forEach(order => {
       if (ordersByStatus[order.status] !== undefined) {
         ordersByStatus[order.status]++;
       }
       
       if (order.status !== 'cancelled') {
         totalRevenue += order.totalAmount;
         
         // Service Stats
         const current = serviceRevenueMap.get(order.serviceId) || { orders: 0, revenue: 0 };
         serviceRevenueMap.set(order.serviceId, {
           orders: current.orders + 1,
           revenue: current.revenue + order.totalAmount
         });
       }
    });

    // Recent Orders (Last 5)
    const sortedOrders = [...allOrders].sort((a, b) => b.id - a.id).slice(0, 5);
    const recentOrders = sortedOrders.map(order => {
      const user = this.users.get(order.userId);
      const service = this.services.get(order.serviceId);
      return {
        ...order,
        userName: user ? user.name : 'Unknown User',
        serviceName: service ? service.name : 'Unknown Service'
      };
    });

    // Recent Users (Last 5)
    const recentUsers = allUsers
      .filter(u => u.role !== 'admin')
      .sort((a, b) => b.id - a.id)
      .slice(0, 5);

    // Top Services
    const topServices = Array.from(serviceRevenueMap.entries())
      .map(([serviceId, stats]) => {
        const service = this.services.get(serviceId);
        return {
          name: service ? service.name : `Service #${serviceId}`,
          orders: stats.orders,
          revenue: stats.revenue
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);


    // Calculate Changes (Current Month vs Previous Month)
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const prevMonthDate = new Date(now);
    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
    const prevMonth = prevMonthDate.getMonth();
    const prevYear = prevMonthDate.getFullYear();

    const currentMonthOrders = allOrders.filter(o => {
      const d = new Date(o.createdAt!);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const prevMonthOrders = allOrders.filter(o => {
      const d = new Date(o.createdAt!);
      return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
    });

    const currentMonthUsers = allUsers.filter(u => {
      const d = new Date(u.createdAt!);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && u.role !== 'admin';
    });

    const prevMonthUsers = allUsers.filter(u => {
      const d = new Date(u.createdAt!);
      return d.getMonth() === prevMonth && d.getFullYear() === prevYear && u.role !== 'admin';
    });

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const currentRevenue = currentMonthOrders.reduce((acc, order) => order.status !== 'cancelled' ? acc + order.totalAmount : acc, 0);
    const prevRevenue = prevMonthOrders.reduce((acc, order) => order.status !== 'cancelled' ? acc + order.totalAmount : acc, 0);

    const currentConversion = currentMonthUsers.length > 0 ? (currentMonthOrders.length / currentMonthUsers.length) * 100 : 0;
    const prevConversion = prevMonthUsers.length > 0 ? (prevMonthOrders.length / prevMonthUsers.length) * 100 : 0;

    return {
      totalUsers,
      totalOrders,
      ordersByStatus,
      totalRevenue,
      recentOrders,
      recentUsers,
      topServices,
      revenueChange: calculateChange(currentRevenue, prevRevenue),
      ordersChange: calculateChange(currentMonthOrders.length, prevMonthOrders.length),
      usersChange: calculateChange(currentMonthUsers.length, prevMonthUsers.length),
      conversionRate: currentConversion,
      conversionRateChange: calculateChange(currentConversion, prevConversion)
    };
  }

  // Reviews
  async getReviews(serviceId: number): Promise<(Review & { userName: string })[]> {
    return Array.from(this.reviews.values())
      .filter(r => r.serviceId === serviceId)
      .map(r => {
        const user = this.users.get(r.userId);
        return { ...r, userName: user?.name || 'Unknown' };
      })
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createReview(insertReview: InsertReview): Promise<StorageResult<Review>> {
    const id = this.currentReviewId++;
    const review: Review = {
      ...insertReview,
      id,
      createdAt: new Date(),
      comment: insertReview.comment ?? null
    };
    this.reviews.set(id, review);
    return { success: true, data: review };
  }

  async canUserReview(userId: number, serviceId: number): Promise<boolean> {
    const userOrders = await this.getOrders(userId);
    return userOrders.some(o => o.serviceId === serviceId && o.status === 'completed');
  }

  // Settings
  async getSetting(key: string): Promise<Setting | undefined> {
    return this.settings.get(key);
  }

  async updateSetting(key: string, value: string): Promise<StorageResult<Setting>> {
    const setting: Setting = { key, value, updatedAt: new Date() };
    this.settings.set(key, setting);
    return { success: true, data: setting };
  }

  async updateOrderLastNotify(id: number, date: Date): Promise<StorageResult<Order>> {
    const order = this.orders.get(id);
    if (!order) return { success: false, error: 'Order not found' };
    
    const updated = { ...order, lastNotifyAt: date };
    this.orders.set(id, updated);
    return { success: true, data: updated };
  }

  async updateOrderCommission(id: number, amount: number, status: string): Promise<StorageResult<Order>> {
    const order = this.orders.get(id);
    if (!order) return { success: false, error: 'Order not found' };
    
    const updated = { ...order, commissionAmount: Math.round(amount), commissionStatus: status };
    this.orders.set(id, updated);
    return { success: true, data: updated };
  }

  // Affiliates
  async getAffiliate(id: number): Promise<Affiliate | undefined> {
    return this.affiliates.get(id);
  }

  async getAffiliateByUserId(userId: number): Promise<Affiliate | undefined> {
    return Array.from(this.affiliates.values()).find(a => a.userId === userId);
  }

  async getAffiliateByCode(code: string): Promise<Affiliate | undefined> {
    return Array.from(this.affiliates.values()).find(a => a.referralCode === code);
  }

  async getAllAffiliates(): Promise<(Affiliate & { user: User })[]> {
    return Array.from(this.affiliates.values()).map(a => {
      const user = this.users.get(a.userId)!;
      return { ...a, user };
    });
  }

  async createAffiliate(insertAffiliate: InsertAffiliate): Promise<StorageResult<Affiliate>> {
    // Check uniqueness
    const existing = await this.getAffiliateByUserId(insertAffiliate.userId);
    if (existing) return { success: false, error: "User is already an affiliate" };
    
    const duplicateCode = await this.getAffiliateByCode(insertAffiliate.referralCode);
    if (duplicateCode) return { success: false, error: "Referral code already exists" };

    const id = this.currentAffiliateId++;
    const affiliate: Affiliate = {
      ...insertAffiliate,
      id,
      commissionRate: insertAffiliate.commissionRate ?? 5.0,
      isActive: insertAffiliate.isActive ?? true,
      createdAt: new Date()
    };
    this.affiliates.set(id, affiliate);
    return { success: true, data: affiliate };
  }

  async updateAffiliate(id: number, updates: Partial<Affiliate>): Promise<StorageResult<Affiliate>> {
    const affiliate = this.affiliates.get(id);
    if (!affiliate) return { success: false, error: "Affiliate not found" };

    if (updates.referralCode && updates.referralCode !== affiliate.referralCode) {
       const duplicate = await this.getAffiliateByCode(updates.referralCode);
       if (duplicate) return { success: false, error: "Referral code already in use" };
    }

    const updated = { ...affiliate, ...updates };
    this.affiliates.set(id, updated);
    return { success: true, data: updated };
  }
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const user = await db.user.findUnique({ where: { id } });
    return user ?? undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await db.user.findUnique({ where: { email } });
    return user ?? undefined;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const user = await db.user.findUnique({ where: { googleId } });
    return user ?? undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return db.user.findMany();
  }
  
  async getAdmins(): Promise<User[]> {
    return db.user.findMany({ where: { role: 'admin' } });
  }

  async createUser(insertUser: InsertUser): Promise<StorageResult<User>> {
    try {
      const data = {
        ...insertUser,
        isVip: insertUser.isVip ?? undefined,
        phone: insertUser.phone ?? undefined,
        googleId: insertUser.googleId ?? undefined,
      };
      const user = await db.user.create({ data });
      return { success: true, data: user };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async updateUserStatus(id: number, status: string): Promise<StorageResult<User>> {
    try {
      const user = await db.user.update({
        where: { id },
        data: { status }
      });
      return { success: true, data: user };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async updateUserVipStatus(id: number, isVip: boolean): Promise<StorageResult<User>> {
    try {
      const user = await db.user.update({
        where: { id },
        data: { isVip }
      });
      return { success: true, data: user };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async updateUser(id: number, updates: Partial<User>): Promise<StorageResult<User>> {
    try {
      const { id: _, ...data } = updates;
      const user = await db.user.update({
        where: { id },
        data: data as any
      });
      return { success: true, data: user };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async updateUserPassword(id: number, passwordHash: string): Promise<StorageResult<void>> {
    try {
      await db.user.update({
        where: { id },
        data: { password: passwordHash }
      });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  // Services
  async getServices(category?: string): Promise<Service[]> {
    let services;
    if (category) {
      services = await db.service.findMany({ where: { category } });
    } else {
      services = await db.service.findMany();
    }
    return services as unknown as Service[];
  }

  async getService(id: number): Promise<Service | undefined> {
    const service = await db.service.findUnique({ where: { id } });
    return (service ?? undefined) as unknown as Service | undefined;
  }

  async createService(insertService: InsertService): Promise<StorageResult<Service>> {
    try {
      const data = {
        name: insertService.name,
        nameEn: insertService.nameEn ?? undefined,
        description: insertService.description,
        descriptionEn: insertService.descriptionEn ?? undefined,
        price: insertService.price,
        category: insertService.category,
        isActive: insertService.isActive ?? undefined,
        imagePath: insertService.imagePath ?? undefined,
        duration: insertService.duration ?? undefined,
      };
      const service = await db.service.create({ data });
      return { success: true, data: service as unknown as Service };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async updateService(id: number, updates: Partial<InsertService>): Promise<StorageResult<Service>> {
    try {
      const { id: _, ...data } = updates as any;
      const filteredData = {
        name: data.name,
        nameEn: data.nameEn,
        description: data.description,
        descriptionEn: data.descriptionEn,
        price: data.price,
        category: data.category,
        isActive: data.isActive,
        imagePath: data.imagePath,
        duration: data.duration,
        updatedAt: data.updatedAt ?? new Date(),
      };

      // Remove undefined keys
      Object.keys(filteredData).forEach(key => (filteredData as any)[key] === undefined && delete (filteredData as any)[key]);

      const service = await db.service.update({
        where: { id },
        data: filteredData
      });
      return { success: true, data: service as unknown as Service };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async deleteService(id: number): Promise<StorageResult<void>> {
    try {
      // Get service first to find image path
      const service = await db.service.findUnique({ where: { id } }) as Service | null;
      
      if (service && service.imagePath) {
        // Only delete local files, not external URLs
        if (!service.imagePath.startsWith('http')) {
          const filePath = path.join(process.cwd(), service.imagePath);
          if (fs.existsSync(filePath)) {
            try {
              fs.unlinkSync(filePath);
            } catch (err) {
              console.error(`Failed to delete image file: ${filePath}`, err);
            }
          }
        }
      }

      await db.service.delete({ where: { id } });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  // Orders
  async getOrders(userId: number): Promise<Order[]> {
    return db.order.findMany({
      where: { userId },
      orderBy: { id: 'desc' },
      include: { service: true }
    });
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.order.findMany({
      where: {
        NOT: { status: 'pending_payment' }
      },
      orderBy: { id: 'desc' }
    });
  }

  async createOrder(insertOrder: InsertOrder): Promise<StorageResult<Order>> {
    try {
      // Prisma JSON handling is automatic if typed correctly
      const data = {
        ...insertOrder,
        currency: 'USD',
        transactionId: insertOrder.transactionId ?? null
      };
      
      const order = await db.order.create({ data: data as any }); 
      return { success: true, data: order };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async updateOrderStatus(id: number, status: string): Promise<StorageResult<Order>> {
    try {
      // Fetch current order to check affiliate status
      const currentOrder = await db.order.findUnique({ where: { id } });
      if (!currentOrder) return { success: false, error: "Order not found" };

      let commissionStatus = currentOrder.commissionStatus;
      if (status === 'completed' && currentOrder.affiliateId && currentOrder.commissionStatus === 'pending') {
        commissionStatus = 'approved';
      } else if (status === 'cancelled' && currentOrder.affiliateId) {
        commissionStatus = 'cancelled';
      }

      const order = await db.order.update({
        where: { id },
        data: { status, commissionStatus }
      });
      return { success: true, data: order };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async payoutAffiliate(payoutId: number): Promise<StorageResult<void>> {
    console.log(`[Storage] Processing payout for payout ID: ${payoutId}`);
    try {
      const payout = await db.payout.findUnique({ where: { id: payoutId } });
      if (!payout) return { success: false, error: 'Payout request not found' };

      // Update the payout status
      await db.payout.update({
        where: { id: payoutId },
        data: { status: 'completed' }
      });

      // Update all orders linked to this payout
      const result = await db.order.updateMany({
        where: { 
          payoutId,
          commissionStatus: 'requested'
        },
        data: {
          commissionStatus: 'paid'
        }
      });
      
      console.log(`[Storage] Payout processed. Updated ${result.count} orders for payout #${payoutId}.`);
      return { success: true, data: undefined };
    } catch (e: any) {
      console.error(`[Storage] Payout error for payout ID ${payoutId}:`, e);
      return { success: false, error: e.message };
    }
  }

  async requestPayout(affiliateId: number, details?: any): Promise<StorageResult<void>> {
    console.log(`[Storage] Requesting payout for affiliate ID: ${affiliateId}`);
    try {
      const approvedOrders = await db.order.findMany({
        where: {
          affiliateId,
          commissionStatus: 'approved'
        }
      });

      const totalApproved = approvedOrders.reduce((sum, o) => sum + (o.commissionAmount || 0), 0);
      console.log(`[Storage] Affiliate ${affiliateId} has $${(totalApproved / 100).toFixed(2)} approved.`);

      if (totalApproved < 2500) {
        return { success: false, error: "Minimum withdrawal amount is $25.00" };
      }

      // Create a Payout record to track this specific withdrawal request
      const payout = await db.payout.create({
        data: {
          affiliateId,
          amount: totalApproved,
          method: 'manual',
          status: 'pending',
          details: details || {},
        }
      });

      await db.order.updateMany({
        where: {
          affiliateId,
          commissionStatus: 'approved'
        },
        data: {
          commissionStatus: 'requested',
          payoutId: payout.id
        } as any
      });

      return { success: true, data: undefined };
    } catch (e: any) {
      console.error(`[Storage] Request payout error for affiliate ${affiliateId}:`, e);
      return { success: false, error: e.message };
    }
  }

  async getPaymentByTransactionId(transactionId: string): Promise<Payment | undefined> {
     const payment = await db.payment.findFirst({ where: { transactionId } });
     return payment ?? undefined;
  }

  async getPayoutRequests(): Promise<any[]> {
    try {
      const pendingPayouts = await db.payout.findMany({
        where: { status: 'pending' },
        include: {
          affiliate: {
            include: { user: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return pendingPayouts.map(p => ({
        id: p.id,
        affiliateId: p.affiliateId,
        amount: p.amount,
        details: p.details,
        createdAt: p.createdAt,
        user: p.affiliate.user,
        referralCode: p.affiliate.referralCode,
        commissionRate: p.affiliate.commissionRate
      }));
    } catch (e: any) {
      console.error("Error fetching payout requests:", e);
      return [];
    }
  }

  async deleteOrder(id: number, userId: number): Promise<StorageResult<void>> {
    try {
      const order = await db.order.findUnique({ where: { id } });
      if (!order) return { success: false, error: "Order not found" };
      if (order.userId !== userId) return { success: false, error: "Unauthorized" };

      await db.order.delete({ where: { id } });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  // Payments
  async getAllPayments(): Promise<Payment[]> {
    return db.payment.findMany({ orderBy: { id: 'desc' } });
  }

  async createPayment(insertPayment: InsertPayment): Promise<StorageResult<Payment>> {
    try {
      const data = {
        ...insertPayment,
        orderId: insertPayment.orderId ?? undefined,
        transactionId: insertPayment.transactionId ?? undefined,
        currency: 'USD',
      };
      const payment = await db.payment.create({ data });
      return { success: true, data: payment };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async updatePaymentStatus(id: number, status: string): Promise<StorageResult<Payment>> {
    try {
      const payment = await db.payment.update({
        where: { id },
        data: { status }
      });
      return { success: true, data: payment };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  // Notifications
  async getNotifications(userId: number): Promise<Notification[]> {
    return db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createNotification(insertNotification: InsertNotification): Promise<StorageResult<Notification>> {
    try {
      const notification = await db.notification.create({ data: insertNotification });
      return { success: true, data: notification };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async markNotificationRead(id: number): Promise<StorageResult<Notification>> {
    try {
      const notification = await db.notification.update({
        where: { id },
        data: { isRead: true }
      });
      return { success: true, data: notification };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async markAllNotificationsRead(userId: number): Promise<StorageResult<void>> {
    try {
      await db.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
      });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  // Reviews
  async getReviews(serviceId: number): Promise<(Review & { userName: string })[]> {
    const reviews = await db.review.findMany({
      where: { serviceId },
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
    
    return reviews.map(r => ({
      ...r,
      userName: r.user.name
    }));
  }

  async createReview(insertReview: InsertReview): Promise<StorageResult<Review>> {
    try {
      const review = await db.review.create({ data: insertReview });
      return { success: true, data: review };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async canUserReview(userId: number, serviceId: number): Promise<boolean> {
    const count = await db.order.count({
      where: {
        userId,
        serviceId,
        status: 'completed'
      }
    });
    return count > 0;
  }

  // Dashboards - Using raw queries or complex Prisma queries
  async getUserDashboardData(userId: number): Promise<UserDashboardData> {
    const userOrders = await this.getOrders(userId);
    const notifications = await this.getNotifications(userId);

    const totalOrders = userOrders.length;
    const ordersByStatus: Record<string, number> = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      completed: 0,
      cancelled: 0,
    };
    
    let totalSpent = 0;
    userOrders.forEach(order => {
      if (ordersByStatus[order.status] !== undefined) {
        ordersByStatus[order.status]++;
      }
      if (order.status !== 'cancelled') {
         totalSpent += order.totalAmount;
      }
    });

    // Recent orders with service name
    // Prisma can do included relation, but we fetched strictly Orders above.
    // Let's optimize by fetching recent orders with include.
    const recentOrdersDb = await db.order.findMany({
      where: { userId },
      orderBy: { id: 'desc' },
      take: 5,
      include: { service: true }
    });
    
    const recentOrders = recentOrdersDb.map(o => ({
      ...o,
      serviceName: o.service.name
    }));

    const unreadNotifications = notifications.filter(n => !n.isRead).length;

    return {
      totalOrders,
      ordersByStatus,
      totalSpent,
      recentOrders,
      unreadNotifications
    };
  }

  async getAdminDashboardData(): Promise<AdminDashboardData> {
    const overallStats = await Promise.all([
      db.user.count({ where: { NOT: { role: 'admin' } } }),
      db.order.count({ where: { NOT: { status: 'pending_payment' } } }),
      db.order.groupBy({
        by: ['status'],
        _count: { status: true },
        where: { NOT: { status: 'pending_payment' } }
      }),
      db.order.aggregate({
        _sum: { totalAmount: true },
        where: { 
          NOT: [
            { status: 'cancelled' },
            { status: 'pending_payment' }
          ]
        }
      })
    ]);
    
    const totalUsers = overallStats[0];
    const totalOrders = overallStats[1];
    
    const ordersByStatus: Record<string, number> = {
      pending: 0, confirmed: 0, processing: 0, completed: 0, cancelled: 0
    };
    overallStats[2].forEach(g => {
      if (ordersByStatus[g.status] !== undefined) ordersByStatus[g.status] = g._count.status;
    });

    const totalRevenue = overallStats[3]._sum.totalAmount || 0;

    // Recent Orders
    const recentOrdersDb = await db.order.findMany({
      orderBy: { id: 'desc' },
      take: 5,
      include: { user: true, service: true }
    });
    const recentOrders = recentOrdersDb.map(o => ({
      ...o,
      userName: o.user.name,
      serviceName: o.service.name
    }));

     // Recent Users
     const recentUsers = await db.user.findMany({
       where: { NOT: { role: 'admin' } },
       orderBy: { id: 'desc' },
       take: 5
     });

     // Top Services (by Revenue)
     // Prisma doesn't support complex ordering on aggregated groups easily in one go.
     // We can do raw query or fetch all orders (expensive) or just aggregate by serviceId.
     // Let's use groupBy
     const topServiceStats = await db.order.groupBy({
       by: ['serviceId'],
       _sum: { totalAmount: true },
       _count: { id: true },
       where: { 
         NOT: [
           { status: 'cancelled' },
           { status: 'pending_payment' }
         ]
       },
     });
     
     // We need service names.
     const serviceIds = topServiceStats.map(s => s.serviceId);
     const services = await db.service.findMany({ where: { id: { in: serviceIds } } });
     const serviceMap = new Map(services.map(s => [s.id, s]));

     const topServices = topServiceStats.map(s => ({
       name: serviceMap.get(s.serviceId)?.name || `Service #${s.serviceId}`,
       orders: s._count.id,
       revenue: s._sum.totalAmount || 0
     }))
     .sort((a, b) => b.revenue - a.revenue)
     .slice(0, 5);


    // Change Calculation
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [currMonthOrders, prevMonthOrders] = await Promise.all([
      db.order.findMany({ 
        where: { 
          createdAt: { gte: currentMonthStart, lt: nextMonthStart },
          NOT: { status: 'pending_payment' }
        } 
      }),
      db.order.findMany({ 
        where: { 
          createdAt: { gte: prevMonthStart, lt: currentMonthStart },
          NOT: { status: 'pending_payment' }
        } 
      })
    ]);

    const [currMonthUsers, prevMonthUsers] = await Promise.all([
      db.user.count({ where: { createdAt: { gte: currentMonthStart, lt: nextMonthStart }, NOT: { role: 'admin' } } }),
      db.user.count({ where: { createdAt: { gte: prevMonthStart, lt: currentMonthStart }, NOT: { role: 'admin' } } })
    ]);

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const curRev = currMonthOrders.reduce((acc, o) => o.status !== 'cancelled' ? acc + o.totalAmount : acc, 0);
    const prevRev = prevMonthOrders.reduce((acc, o) => o.status !== 'cancelled' ? acc + o.totalAmount : acc, 0);

    // Conversion Rate
    const curConversion = currMonthUsers > 0 ? (currMonthOrders.length / currMonthUsers) * 100 : 0;
    const prevConversion = prevMonthUsers > 0 ? (prevMonthOrders.length / prevMonthUsers) * 100 : 0;

    return {
      totalUsers,
      totalOrders,
      ordersByStatus,
      totalRevenue,
      recentOrders,
      recentUsers,
      topServices,
      revenueChange: calculateChange(curRev, prevRev),
      ordersChange: calculateChange(currMonthOrders.length, prevMonthOrders.length),
      usersChange: calculateChange(currMonthUsers, prevMonthUsers),
      conversionRate: curConversion,
      conversionRateChange: calculateChange(curConversion, prevConversion)
    };
  }

  // Settings
  async getSetting(key: string): Promise<Setting | undefined> {
    const setting = await db.setting.findUnique({ where: { key } });
    return setting ?? undefined;
  }

  async updateSetting(key: string, value: string): Promise<StorageResult<Setting>> {
    try {
      const setting = await db.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value }
      });
      return { success: true, data: setting };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async updateOrderLastNotify(id: number, date: Date): Promise<StorageResult<Order>> {
    try {
      const order = await db.order.update({
        where: { id },
        data: { lastNotifyAt: date } as any
      });
      return { success: true, data: order };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async updateOrderCommission(id: number, amount: number, status: string): Promise<StorageResult<Order>> {
    try {
      const order = await db.order.update({
        where: { id },
        data: { 
          commissionAmount: Math.round(amount),
          commissionStatus: status
        }
      });
      return { success: true, data: order };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  // Affiliates
  async getAffiliate(id: number): Promise<Affiliate | undefined> {
    const affiliate = await db.affiliate.findUnique({ where: { id } });
    return affiliate ?? undefined;
  }

  async getAffiliateByUserId(userId: number): Promise<Affiliate | undefined> {
    const affiliate = await db.affiliate.findUnique({ where: { userId } });
    return affiliate ?? undefined;
  }

  async getAffiliateByCode(referralCode: string): Promise<Affiliate | undefined> {
    const affiliate = await db.affiliate.findUnique({ where: { referralCode } });
    return affiliate ?? undefined;
  }

  async getAllAffiliates(): Promise<(Affiliate & { user: User })[]> {
    return db.affiliate.findMany({ include: { user: true } });
  }

  async createAffiliate(insertAffiliate: InsertAffiliate): Promise<StorageResult<Affiliate>> {
    try {
      const affiliate = await db.affiliate.create({ 
        data: {
          userId: insertAffiliate.userId,
          referralCode: insertAffiliate.referralCode,
          commissionRate: insertAffiliate.commissionRate ?? 5.0,
          isActive: insertAffiliate.isActive ?? true
        } 
      });
      return { success: true, data: affiliate };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async updateAffiliate(id: number, updates: Partial<Affiliate>): Promise<StorageResult<Affiliate>> {
    try {
      const { id: _, userId, ...data } = updates; // Prevent updating id or userId
      const affiliate = await db.affiliate.update({
        where: { id },
        data: data as any
      });
      return { success: true, data: affiliate };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
}

export const storage = new DatabaseStorage();
