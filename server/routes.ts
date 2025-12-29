import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserSchema, insertServiceSchema, insertOrderSchema } from "@shared/schema";
import { Router } from "express";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Prefix all routes with /api/v1 to match frontend expectations
  const apiRouter = Router();

  // --- Public Routes ---

  // Get Services
  apiRouter.get('/services', async (req, res) => {
    const services = await storage.getServices();
    res.json({ data: services }); // Wrapping in data object often used in Laravel resources
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
    
    // Simple password check (In production use hashing)
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Mock token
    const token = `mock-token-${user.id}`;
    res.json({ 
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  });

  // Register
  apiRouter.post('/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }

      const user = await storage.createUser(userData);
      const token = `mock-token-${user.id}`;
      
      res.status(201).json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (e) {
      res.status(400).json({ message: 'Validation error', errors: e });
    }
  });

  // --- Authenticated Routes (Mocked Auth Middleware) ---
  
  // Me
  apiRouter.get('/me', async (req, res) => {
    // In a real app, parse the Bearer token
    // For now, return a mock user or the first user
    const user = await storage.getUser(1); // Default to admin for demo
    res.json({ data: user });
  });

  // Customer Orders
  apiRouter.post('/orders', async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      res.status(201).json({ data: order });
    } catch (e) {
      res.status(400).json({ message: 'Validation error', errors: e });
    }
  });

  apiRouter.get('/orders/my', async (req, res) => {
    // Mock user ID 1
    const orders = await storage.getOrders(1);
    res.json({ data: orders });
  });

  // Admin Routes
  apiRouter.get('/admin/orders', async (req, res) => {
    const orders = await storage.getAllOrders();
    res.json({ data: orders });
  });

  apiRouter.patch('/admin/orders/:id/status', async (req, res) => {
    const { status } = req.body;
    const order = await storage.updateOrderStatus(Number(req.params.id), status);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ data: order });
  });

  app.use('/api/v1', apiRouter);

  return httpServer;
}
