/**
 * server/config/db.ts
 * 
 * Database configuration and Prisma client initialization.
 * Validates DATABASE_URL environment variable and creates a singleton Prisma client
 * with query logging enabled for development and debugging.
 */

import { PrismaClient } from "@prisma/client";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

export const db = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});
