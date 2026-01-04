import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserSchema, insertServiceSchema, insertOrderSchema, insertReviewSchema, SERVICE_CATEGORIES } from "@shared/schema";
import { Router } from "express";
import { signToken, hashPassword, comparePassword, authMiddleware, adminMiddleware } from "./auth";
import { NotificationService } from "./notification.service";
import { emitNewOrder, emitNewUser } from "./socket";
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
