import { PrismaClient } from "@prisma/client";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

export const db = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});
