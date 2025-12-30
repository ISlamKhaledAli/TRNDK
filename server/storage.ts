import { users, services, orders, type User, type InsertUser, type Service, type InsertService, type Order, type InsertOrder } from "@shared/schema";

export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<StorageResult<User>>;
  
  // Services
  getServices(): Promise<Service[]>;
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private services: Map<number, Service>;
  private orders: Map<number, Order>;
  private currentUserId: number;
  private currentServiceId: number;
  private currentOrderId: number;

  constructor() {
    this.users = new Map();
    this.services = new Map();
    this.orders = new Map();
    this.currentUserId = 1;
    this.currentServiceId = 1;
    this.currentOrderId = 1;

    // Seed mock data
    this.seedData();
  }

  private seedData() {
    // Seed Admin
    this.createUser({
      name: "Admin User",
      email: "admin@example.com",
      password: "password", // In production, hash this!
      role: "admin",
    });

    // Seed Customer
    this.createUser({
      name: "Customer User",
      email: "customer@example.com",
      password: "password",
      role: "customer",
    });

    // Seed Services
    this.createService({
      name: "Premium Cleaning",
      description: "Full house premium cleaning service",
      price: 150,
      category: "Cleaning",
      duration: "4 hours",
      imageUrl: "https://images.unsplash.com/photo-1581578731117-104f2a8d23e9?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    });

    this.createService({
      name: "Standard Gardening",
      description: "Basic garden maintenance",
      price: 100,
      category: "Gardening",
      duration: "2 hours",
      imageUrl: "https://images.unsplash.com/photo-1557429287-b2e26467fc2b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    });
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

  async createUser(insertUser: InsertUser): Promise<StorageResult<User>> {
    if (!insertUser.email || !insertUser.name || !insertUser.password) {
      return { success: false, error: 'Email, name, and password are required' };
    }
    
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      role: insertUser.role || 'customer'
    };
    this.users.set(id, user);
    return { success: true, data: user };
  }

  // Services
  async getServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }

  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async createService(insertService: InsertService): Promise<StorageResult<Service>> {
    if (!insertService.name || !insertService.description || insertService.price === undefined) {
      return { success: false, error: 'Name, description, and price are required' };
    }
    
    const id = this.currentServiceId++;
    const now = new Date();
    const service: Service = { 
      ...insertService, 
      id, 
      createdAt: now, 
      updatedAt: now,
      isActive: insertService.isActive ?? true,
      imageUrl: insertService.imageUrl ?? null,
      category: insertService.category ?? null,
      duration: insertService.duration ?? null
    };
    this.services.set(id, service);
    return { success: true, data: service };
  }

  async updateService(id: number, updates: Partial<InsertService>): Promise<StorageResult<Service>> {
    const existing = this.services.get(id);
    if (!existing) {
      return { success: false, error: 'Service not found' };
    }
    
    const updated: Service = { ...existing, ...updates, updatedAt: new Date() };
    this.services.set(id, updated);
    return { success: true, data: updated };
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
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
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
    
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` };
    }
    
    const updatedOrder = { ...order, status, updatedAt: new Date() };
    this.orders.set(id, updatedOrder);
    return { success: true, data: updatedOrder };
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
}

export const storage = new MemStorage();
