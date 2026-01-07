/**
 * shared/schema.ts
 * 
 * Shared type definitions and Zod validation schemas.
 * Defines interfaces and validation schemas for:
 * - Users, Services, Orders, Payments, Notifications, Reviews, Settings
 * - API request/response types
 * Used by both client and server for type safety and validation.
 */

import { z } from "zod";

// === CONSTANTS ===
export const SERVICE_CATEGORIES = ["Instagram", "Facebook", "TikTok", "YouTube", "Other Services"] as const;
export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

export const COMMISSION_STATUS = {
  NONE: "none",
  PENDING: "pending",
  APPROVED: "approved",
  REQUESTED: "requested",
  PAID: "paid",
  CANCELLED: "cancelled"
} as const;
export type CommissionStatus = (typeof COMMISSION_STATUS)[keyof typeof COMMISSION_STATUS];

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


export interface Affiliate {
  id: number;
  userId: number;
  referralCode: string;
  commissionRate: number;
  isActive: boolean;
  createdAt?: Date | null;
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
  lastNotifyAt?: Date | null;
  transactionId?: string | null;
  currency?: string; // Enforced USD
  service?: Service; // For frontend convenience
  
  // Affiliate Fields
  affiliateId?: number | null;
  commissionAmount?: number | null;
  commissionStatus?: string | null;
}

export interface Payment {
  id: number;
  userId: number;
  orderId?: number | null;
  amount: number;
  method: string;
  status: string;
  transactionId?: string | null;
  currency?: string; // Enforced USD
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
  transactionId: z.string().optional().nullable(),
  currency: z.string().default("USD"),
});

export const insertPaymentSchema = z.object({
  userId: z.number().int(),
  orderId: z.number().int().optional().nullable(),
  amount: z.number().int(),
  method: z.string(),
  status: z.string().optional().default("pending"),
  transactionId: z.string().optional().nullable(),
  currency: z.string().default("USD"),
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

export const insertAffiliateSchema = z.object({
  userId: z.number().int(),
  referralCode: z.string().min(3, "Referral code must be at least 3 characters"),
  commissionRate: z.number().min(0).max(100).default(10.0),
  isActive: z.boolean().default(true),
});

export const checkoutSchema = z.object({
  items: z.array(z.object({
    serviceId: z.number().int(),
    quantity: z.number().int().min(1),
    link: z.string().min(1),
    price: z.number().int().nonnegative().describe("FOR DISPLAY ONLY - Backend ignores this and uses DB price"),
    // Allow any other details needed per item
  })),
  paymentMethod: z.string(),
  referralCode: z.string().optional(), // Add referral code to checkout
});

// === TYPE INFERENCE ===
export type InsertUser = z.input<typeof insertUserSchema>;
export type InsertService = z.input<typeof insertServiceSchema>;
export type InsertOrder = z.input<typeof insertOrderSchema>;
export type InsertPayment = z.input<typeof insertPaymentSchema>;
export type InsertNotification = z.input<typeof insertNotificationSchema>;
export type InsertReview = z.input<typeof insertReviewSchema>;
export type InsertSetting = z.input<typeof insertSettingSchema>;
export type InsertAffiliate = z.input<typeof insertAffiliateSchema>;

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
