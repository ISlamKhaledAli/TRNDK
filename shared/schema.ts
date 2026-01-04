import { z } from "zod";

// === CONSTANTS ===
export const SERVICE_CATEGORIES = ["Instagram", "Facebook", "TikTok", "YouTube"] as const;
export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

// === TYPE DEFINITIONS ===
// Matching Prisma schema and application needs

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  phone?: string | null;
  status: string;
  isVip?: boolean | null;
  googleId?: string | null;
  createdAt?: Date | null;
}

export interface Service {
  id: number;
  name: string;
  nameEn?: string | null;
  description: string;
  descriptionEn?: string | null;
  price: number;
  imageUrl?: string | null;
  category: string;
  duration?: string | null;
  isActive?: boolean | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface Order {
  id: number;
  userId: number;
  serviceId: number;
  status: string;
  totalAmount: number;
  details?: any | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface Payment {
  id: number;
  userId: number;
  orderId?: number | null;
  amount: number;
  method: string;
  status: string;
  transactionId?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface Notification {
  id: number;
  userId: number;
  orderId?: number | null;
  title: string;
  message: string;
  isRead: boolean;
  createdAt?: Date | null;
}

export interface Setting {
  key: string;
  value: string;
  updatedAt?: Date | null;
}

export interface Review {
  id: number;
  userId: number;
  serviceId: number;
  rating: number;
  comment?: string | null;
  createdAt?: Date | null;
}

// === SCHEMAS ===

export const insertUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string().optional().default("customer"),
  phone: z.string().optional().nullable(),
  googleId: z.string().optional().nullable(),
  status: z.string().optional().default("active"),
  isVip: z.boolean().optional().default(false),
});

export const insertServiceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  nameEn: z.string().optional().nullable(),
  description: z.string().min(1, "Description is required"),
  descriptionEn: z.string().optional().nullable(),
  price: z.number().int().positive("Price must be a positive integer"),
  imageUrl: z.string().optional().nullable(),
  category: z.enum(SERVICE_CATEGORIES, {
    required_error: "Category is required",
    invalid_type_error: "Invalid category",
  }),
  duration: z.string().optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

export const insertOrderSchema = z.object({
  userId: z.number().int(),
  serviceId: z.number().int(),
  status: z.string().optional().default("pending"),
  totalAmount: z.number().int(),
  details: z.any().optional().nullable(),
});

export const insertPaymentSchema = z.object({
  userId: z.number().int(),
  orderId: z.number().int().optional().nullable(),
  amount: z.number().int(),
  method: z.string(),
  status: z.string().optional().default("pending"),
  transactionId: z.string().optional().nullable(),
});

export const insertNotificationSchema = z.object({
  userId: z.number().int(),
  orderId: z.number().int().optional().nullable(),
  title: z.string(),
  message: z.string(),
});

export const insertReviewSchema = z.object({
  userId: z.number().int(),
  serviceId: z.number().int(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional().nullable(),
});

export const insertSettingSchema = z.object({
  key: z.string(),
  value: z.string(),
});

// === TYPE INFERENCE ===
export type InsertUser = z.input<typeof insertUserSchema>;
export type InsertService = z.input<typeof insertServiceSchema>;
export type InsertOrder = z.input<typeof insertOrderSchema>;
export type InsertPayment = z.input<typeof insertPaymentSchema>;
export type InsertNotification = z.input<typeof insertNotificationSchema>;
export type InsertReview = z.input<typeof insertReviewSchema>;
export type InsertSetting = z.input<typeof insertSettingSchema>;

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
