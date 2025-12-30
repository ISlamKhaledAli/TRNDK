import { users, services, orders, type User, type InsertUser, type Service, type InsertService, type Order, type InsertOrder } from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Services
  getServices(): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: number): Promise<boolean>;
  
  // Orders
  getOrders(userId: number): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  deleteOrder(id: number): Promise<boolean>;
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  // Services
  async getServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }

  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async createService(insertService: InsertService): Promise<Service> {
    const id = this.currentServiceId++;
    const service: Service = { ...insertService, id, createdAt: new Date(), isActive: insertService.isActive ?? true };
    this.services.set(id, service);
    return service;
  }

  async updateService(id: number, updates: Partial<InsertService>): Promise<Service | undefined> {
    const existing = this.services.get(id);
    if (!existing) return undefined;
    const updated: Service = { ...existing, ...updates };
    this.services.set(id, updated);
    return updated;
  }

  async deleteService(id: number): Promise<boolean> {
    return this.services.delete(id);
  }

  // Orders
  async getOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const order: Order = { ...insertOrder, id, createdAt: new Date() };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    const updatedOrder = { ...order, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async deleteOrder(id: number): Promise<boolean> {
    return this.orders.delete(id);
  }
}

export const storage = new MemStorage();
