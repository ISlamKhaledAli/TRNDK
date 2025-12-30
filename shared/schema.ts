import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  varchar,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("customer").notNull(), // 'admin' | 'customer'
  createdAt: timestamp("created_at").defaultNow(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // stored in cents or smallest unit
  imageUrl: text("image_url"),
  category: text("category"),
  duration: text("duration"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // references users.id
  serviceId: integer("service_id").notNull(), // references services.id
  status: text("status").default("pending").notNull(), // 'pending', 'confirmed', 'completed', 'cancelled'
  totalAmount: integer("total_amount").notNull(),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === SCHEMAS ===
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});
export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
});
export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

// === TYPES ===
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

// API Types
export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = InsertUser;

export type AuthResponse = {
  user: User;
  token: string;
};
