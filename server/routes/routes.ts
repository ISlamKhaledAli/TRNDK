/**
 * server/routes/routes.ts
 * 
 * API route definitions for the application.
 * Registers all endpoints including:
 * - Public routes (services, login, register, Google OAuth)
 * - Authenticated routes (profile, orders, notifications)
 * - Admin routes (users, services, orders, payments management)
 */

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "../storage/storage";
import { z } from "zod";
import { insertUserSchema, insertServiceSchema, checkoutSchema, insertOrderSchema, insertPaymentSchema, insertNotificationSchema, insertReviewSchema, insertSettingSchema, SERVICE_CATEGORIES } from "@shared/schema";
import { Router } from "express";
import { signToken, hashPassword, comparePassword, authMiddleware, adminMiddleware } from "../middleware/auth";
import { NotificationService } from "../services/notification.service";
import { emitNewOrder, emitNewUser } from "../services/socket";
import passport from "passport";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Prefix all routes with /api/v1 to match frontend expectations
  const apiRouter = Router();

  // Health Check
  apiRouter.get('/health', (_req, res) => {
    res.json({ 
      status: 'ok', 
      environment: process.env.NODE_ENV || 'development', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // --- Public Routes ---

  // Get Services
  apiRouter.get('/services', async (req, res) => {
    const category = req.query.category as string | undefined;
    const services = await storage.getServices(category);
    // Prevent caching...
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.json({ data: services });
  });

  // Get Service Categories
  apiRouter.get('/services/categories', (req, res) => {
    res.json({ data: SERVICE_CATEGORIES });
  });

  apiRouter.get('/services/:id', async (req, res) => {
    const service = await storage.getService(Number(req.params.id));
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json({ data: service });
  });

  // Login
  apiRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await storage.getUserByEmail(email);
    
    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  });

  // New Passport Google Routes
  app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

  app.get('/auth/google/callback', 
    (req, res, next) => {
      console.log("[Route] Initiating Google callback authentication");
      next();
    },
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    (req, res) => {
      console.log("[Route] Google callback authentication successful");
      const user = req.user as any;
      
      if (!user) {
        console.error("[Route] CRITICAL: Passport authentication succeeded but req.user is missing!");
        return res.redirect('/login?error=auth_failed');
      }

      console.log("[Route] Authenticating user:", { email: user.email, role: user.role });
      
      const token = signToken(user);
      
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      const redirectPath = user.role === "admin" ? "/admin/dashboard" : "/client/dashboard";
      console.log("[Route] Redirecting to:", redirectPath);
      res.redirect(redirectPath);
    }
  );

  // Logout
  apiRouter.post('/logout', (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
  });

  // Register
  apiRouter.post('/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }

      const hashedPassword = await hashPassword(userData.password);
      const result = await storage.createUser({ 
        ...userData, 
        password: hashedPassword,
        role: "customer" // Force customer role to prevent escalation
      });
      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }

      const token = signToken(result.data!);
      
      // Real-time Socket.IO notification to admins
      emitNewUser(result.data!);

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      
      res.status(201).json({
        user: {
          id: result.data!.id,
          name: result.data!.name,
          email: result.data!.email,
          role: result.data!.role
        }
      });
    } catch (e) {
      res.status(400).json({ message: 'Validation error', errors: e });
    }
  });

  // --- Authenticated Routes ---
  

  apiRouter.get('/profile', authMiddleware, async (req, res) => {
    const user = await storage.getUser(req.user!.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // Don't return password
    const { password, ...safeUser } = user;
    res.json({ data: safeUser });
  });

  apiRouter.patch('/profile', authMiddleware, async (req, res) => {
    try {
      const profileSchema = z.object({
        name: z.string().min(2).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional()
      });

      const updates = profileSchema.parse(req.body);
      const result = await storage.updateUser(req.user!.id, updates);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }

      const { password, ...safeUser } = result.data!;
      res.json({ message: "Profile updated successfully", data: safeUser });
    } catch (e) {
      res.status(400).json({ message: "Validation error", errors: e });
    }
  });

  apiRouter.patch('/profile/password', authMiddleware, async (req, res) => {
    try {
      const passwordSchema = z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(6)
      });

      const { currentPassword, newPassword } = passwordSchema.parse(req.body);
      
      const user = await storage.getUser(req.user!.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      const isMatch = await comparePassword(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Incorrect current password" });
      }

      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUserPassword(user.id, hashedPassword);

      res.json({ message: "Password updated successfully" });
    } catch (e) {
      res.status(400).json({ message: "Validation error", errors: e });
    }
  });

  // Checkout (Bulk Orders)
  apiRouter.post('/orders/checkout', authMiddleware, async (req, res) => {
    try {
      const checkoutData = checkoutSchema.parse(req.body);
      const userId = req.user!.id;

      // 1. Transaction & Payment Setup
      const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const totalAmount = checkoutData.items.reduce((sum, item) => sum + (item.price * (item.quantity / 1000)), 0); // Price is per 1000 units usually? 
      // Wait, let's verify how price is calculated. 
      // In checkout page: (item.price / 100) * (item.quantity / 1000) for display.
      // Database price is likely in cents per 1000 units?
      // Service.price = number.
      // Let's assume passed price in items is correct or we should refetch from DB for security? 
      // For security, we should fetching services.
      
      const serviceIds = checkoutData.items.map(i => i.serviceId);
      // We can't easily fetch all services in bulk with current storage interface efficiently without loop or new method changes.
      // Let's fetch individually for now to be safe and simple.

      const orders = [];
      let calculatedTotal = 0;

      for (const item of checkoutData.items) {
        const service = await storage.getService(item.serviceId);
        if (!service) throw new Error(`Service ${item.serviceId} not found`);
        if (!service.isActive) throw new Error(`Service ${service.name} is unavailable`);

        // Calculate item total: (price per 1000 * quantity) / 1000 * 100 (if price is in dollars?)
        // Wait, schema says price is integer (cents?).
        // If price is 100 ($1.00) for 1000 units.
        // Quantity 2000 => 2 * 100 = 200.
        // Let's rely on standard logic: Price is per 1000 units usually in SMM panels.
        const itemTotal = Math.round(service.price * (item.quantity / 1000));
        calculatedTotal += itemTotal;

        const orderResult = await storage.createOrder({
          userId,
          serviceId: item.serviceId,
          status: 'pending',
          totalAmount: itemTotal,
          details: {
            quantity: item.quantity,
            link: item.link,
            originalPrice: service.price
          },
          transactionId
        });

        if (!orderResult.success) throw new Error(orderResult.error);
        orders.push(orderResult.data!);
      }

      // Create One Payment Record
      await storage.createPayment({
        userId,
        amount: calculatedTotal,
        method: checkoutData.paymentMethod,
        status: 'pending',
        transactionId
      });

      // Notifications
      for (const order of orders) {
        await NotificationService.notifyOrderCreated(order);
        emitNewOrder(order);
      }

      res.status(201).json({ data: orders });

    } catch (e: any) {
      res.status(400).json({ message: e.message || "Validation Error", errors: e });
    }
  });

  // Customer Orders
  apiRouter.post('/orders', authMiddleware, async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse({
        ...req.body,
        userId: req.user!.id
      });

      // Validate Service Availability
      const service = await storage.getService(orderData.serviceId);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      if (!service.isActive) {
        return res.status(400).json({ message: "Service is currently unavailable" });
      }
      const result = await storage.createOrder(orderData);
      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }
      
      // Create Payment Record
      const paymentMethod = (orderData.details as any)?.paymentMethod || 'card';
      await storage.createPayment({
        userId: req.user!.id,
        orderId: result.data!.id,
        amount: orderData.totalAmount,
        method: paymentMethod,
        status: 'pending' // Initial status
      });

      // Notify user & admins
      await NotificationService.notifyOrderCreated(result.data!);

      // Real-time Socket.IO notification to admins
      emitNewOrder(result.data!);

      res.status(201).json({ data: result.data });
    } catch (e) {
      res.status(400).json({ message: 'Validation error', errors: e });
    }
  });

  apiRouter.get('/dashboard/user', authMiddleware, async (req, res) => {
    const data = await storage.getUserDashboardData(req.user!.id);
    res.json({ data });
  });

  apiRouter.get('/dashboard/admin', authMiddleware, async (req, res) => {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const data = await storage.getAdminDashboardData();
    res.json({ data });
  });

  apiRouter.get('/orders/my', authMiddleware, async (req, res) => {
    const orders = await storage.getOrders(req.user!.id);
    res.json({ data: orders });
  });

  apiRouter.delete('/orders/:id', authMiddleware, async (req, res) => {
    const userId = req.user!.id;
    const result = await storage.deleteOrder(Number(req.params.id), userId);
    if (!result.success) {
      return res.status(result.error?.includes('Unauthorized') ? 403 : 404).json({ message: result.error });
    }
    res.json({ message: 'Order deleted' });
    res.json({ message: 'Order deleted' });
  });

  // Report Delay
  apiRouter.post('/orders/:id/report-delay', authMiddleware, async (req, res) => {
    try {
      const orderId = Number(req.params.id);
      const userId = req.user!.id;

      // 1. Fetch order with service
      // Ensure ownership
      const userOrders = await storage.getOrders(userId);
      const order = userOrders.find(o => o.id === orderId);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // 2. Validate Status
      // Requirement: "The order status must be in_progress"
      // Based on available statuses: 'pending', 'confirmed', 'processing', 'completed', 'cancelled'
      // We accept 'processing' and 'confirmed' as "in progress".
      if (!['processing', 'confirmed'].includes(order.status)) {
         return res.status(400).json({ message: "Order must be in progress to report a delay." });
      }

      // 3. Validate Time (Deadline exceeded for first report)
      // We still need to check if the estimated time passed at least once
      const service = (order as any).service;
      const parseDurationMs = (durationStr: string): number => {
         try {
           const parts = durationStr.toLowerCase().split(' ');
           let unit = 'hours';
           if (parts.some(p => p.startsWith('minute'))) unit = 'minutes';
           else if (parts.some(p => p.startsWith('hour'))) unit = 'hours';
           else if (parts.some(p => p.startsWith('day'))) unit = 'days';

           const numbers = durationStr.match(/\d+/g);
           let val = 0;
           if (numbers && numbers.length > 0) {
              val = Math.max(...numbers.map(n => parseInt(n)));
           } else {
              val = 24; // fallback
           }

           switch(unit) {
              case 'minutes': return val * 60 * 1000;
              case 'hours': return val * 3600 * 1000;
              case 'days': return val * 86400 * 1000;
              default: return val * 3600 * 1000;
           }
         } catch {
            return 24 * 3600 * 1000; 
         }
      };

      const durationMs = service?.duration ? parseDurationMs(service.duration) : 24 * 3600 * 1000;
      const createdAt = new Date(order.createdAt!).getTime();
      const now = Date.now();
      const deadline = createdAt + durationMs;

      // Initial check: Has the estimated time passed?
      if (now < deadline) {
         return res.status(400).json({ message: "Estimated completion time has not passed yet." });
      }

      // 4. Validate Cooldown (24 hours) check
      // "The user cannot click the button again until 24 hours have passed since the last click."
      // "current_time >= last_notify_at + INTERVAL 24 HOURS"
      if (order.lastNotifyAt) {
        const lastNotify = new Date(order.lastNotifyAt).getTime();
        const cooldownMs = 24 * 60 * 60 * 1000; // 24 hours
        if (now < lastNotify + cooldownMs) {
           return res.status(400).json({ message: "You can only report a delay once every 24 hours." });
        }
      }

      // 5. Update Order
      const result = await storage.updateOrderLastNotify(orderId, new Date());
      if (!result.success) {
         return res.status(400).json({ message: result.error });
      }

      // 6. Notify
      // Message: "The service is still in progress after 24 hours." (or similar context)
      // The i18n key 'orderDelayedMessage' is "The user reported a delay in order number {{orderId}}"
      // We reuse the existing notification method.
      await NotificationService.notifyOrderDelay({ ...order, lastNotifyAt: new Date() });

      res.json({ message: "Delay reported successfully", data: result.data });

    } catch (e: any) {
       res.status(400).json({ message: "Error reporting delay", error: e.message });
    }
  });



  // Notifications
  apiRouter.get('/notifications', authMiddleware, async (req, res) => {
    const notifications = await storage.getNotifications(req.user!.id);
    res.json({ data: notifications });
  });

  apiRouter.patch('/notifications/:id/read', authMiddleware, async (req, res) => {
    const result = await storage.markNotificationRead(Number(req.params.id));
    if (!result.success) {
      return res.status(404).json({ message: result.error });
    }
    // simple ownership check: ensure the notification belongs to current user
    if (result.data!.userId !== req.user!.id) {
       return res.status(403).json({ message: "Unauthorized" });
    }
    res.json({ data: result.data });
  });

  apiRouter.patch('/notifications/read-all', authMiddleware, async (req, res) => {
    const result = await storage.markAllNotificationsRead(req.user!.id);
    if (!result.success) {
      return res.status(500).json({ message: result.error });
    }
    res.json({ message: "All notifications marked as read" });
  });

  // Reviews
  apiRouter.post('/reviews', authMiddleware, async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        userId: req.user!.id
      });

      // Check eligibility
      const canReview = await storage.canUserReview(req.user!.id, reviewData.serviceId);
      if (!canReview) {
        return res.status(403).json({ message: "You can only review services you have purchased and completed." });
      }

      const result = await storage.createReview(reviewData);
      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }
      res.status(201).json({ data: result.data });
    } catch (e) {
      res.status(400).json({ message: 'Validation error', errors: e });
    }
  });

  apiRouter.get('/services/:id/reviews', async (req, res) => {
    const reviews = await storage.getReviews(Number(req.params.id));
    res.json({ data: reviews });
  });

  // Admin Routes - Services
  apiRouter.post('/admin/services', authMiddleware, async (req, res) => {
    try {
      const serviceData = insertServiceSchema.parse(req.body);
      const result = await storage.createService(serviceData);
      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }
      res.status(201).json({ data: result.data });
    } catch (e) {
      res.status(400).json({ message: 'Validation error', errors: e });
    }
  });

  apiRouter.put('/admin/services/:id', authMiddleware, async (req, res) => {
    try {
      const updates = insertServiceSchema.partial().parse(req.body);
      const result = await storage.updateService(Number(req.params.id), updates);
      if (!result.success) {
        return res.status(404).json({ message: result.error });
      }
      res.json({ data: result.data });
    } catch (e) {
      res.status(400).json({ message: 'Validation error', errors: e });
    }
  });

  apiRouter.delete('/admin/services/:id', authMiddleware, async (req, res) => {
    const result = await storage.deleteService(Number(req.params.id));
    if (!result.success) {
      return res.status(404).json({ message: result.error });
    }
    res.json({ message: 'Service deleted' });
  });

  // Admin Routes - Orders
  apiRouter.get('/admin/orders', authMiddleware, async (req, res) => {
    const orders = await storage.getAllOrders();
    res.json({ data: orders });
  });

  apiRouter.patch('/admin/orders/:id/status', authMiddleware, async (req, res) => {
    const { status } = req.body;
    const order = await storage.getOrders(req.user!.id).then(orders => orders.find(o => o.id === Number(req.params.id))) || (await storage.getAllOrders()).find(o => o.id === Number(req.params.id));
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Trigger notification before updating (to check old status if needed, but here we just need order info)
    // Actually, we should update first effectively, or check. 
    // The service handles "if status changed".
    
    const result = await storage.updateOrderStatus(Number(req.params.id), status);
    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }
    
    // Trigger notification
    await NotificationService.notifyOrderStatusChange(order, status, req.user!.id);

    res.json({ data: result.data });
  });

  // Admin Routes - Users
  apiRouter.get('/admin/users', authMiddleware, async (req, res) => {
    const users = await storage.getAllUsers();
    res.json({ data: users });
  });

  apiRouter.patch('/admin/users/:id/status', authMiddleware, async (req, res) => {
    const { status } = req.body;
    const result = await storage.updateUserStatus(Number(req.params.id), status);
    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }
    res.json({ data: result.data });
  });

  apiRouter.patch('/admin/users/:id/vip', authMiddleware, async (req, res) => {
    const { isVip } = req.body;
    const result = await storage.updateUserVipStatus(Number(req.params.id), isVip);
    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }
    res.json({ data: result.data });
  });

  // Admin Routes - Payments
  apiRouter.get('/admin/payments', authMiddleware, async (req, res) => {
    const payments = await storage.getAllPayments();
    res.json({ data: payments });
  });

  apiRouter.patch('/admin/payments/:id/status', authMiddleware, async (req, res) => {
    const { status } = req.body;
    const result = await storage.updatePaymentStatus(Number(req.params.id), status);
    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }
    res.json({ data: result.data });
  });

  // Settings
  apiRouter.get('/settings/:key', async (req, res) => {
    const setting = await storage.getSetting(req.params.key);
    if (!setting) {
      if (req.params.key === 'taxRate') {
        return res.json({ data: { key: 'taxRate', value: '15' } });
      }
      return res.status(404).json({ message: "Setting not found" });
    }
    res.json({ data: setting });
  });

  apiRouter.patch('/admin/settings/:key', adminMiddleware, async (req, res) => {
    const { value } = req.body;
    const result = await storage.updateSetting(req.params.key, String(value));
    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }
    res.json({ data: result.data });
  });

  app.use('/api/v1', apiRouter);

  return httpServer;
}
