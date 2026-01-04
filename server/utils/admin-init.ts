import { db } from "../config/db";
import { hashSync } from "bcryptjs";
import "dotenv/config";

/**
 * Checks if at least one admin exists in the database.
 * If not, creates a default admin user based on environment variables.
 */
export async function ensureAdminExists() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  try {
    // 1. Check if admin credentials are provided
    if (!adminEmail || !adminPassword) {
      console.warn(
        "\x1b[33m%s\x1b[0m", // Yellow text
        "[admin-init] WARNING: ADMIN_EMAIL or ADMIN_PASSWORD missing in .env. Skipping admin creation check."
      );
      return;
    }

    // 2. Check if any user with role 'admin' already exists
    const existingAdmin = await db.user.findFirst({
      where: { role: "admin" },
    });

    if (existingAdmin) {
      console.log(`[admin-init] Admin user already exists: ${existingAdmin.email}`);
      return;
    }

    // 3. Create initial admin if none exists
    const hashedPassword = hashSync(adminPassword, 10);

    const newAdmin = await db.user.create({
      data: {
        name: "System Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        status: "active",
        isVip: true,
      },
    });

    console.log(
      "\x1b[32m%s\x1b[0m", // Green text
      `[admin-init] Default admin created successfully: ${newAdmin.email}`
    );
  } catch (error) {
    console.error(
      "\x1b[31m%s\x1b[0m", // Red text
      "[admin-init] Fatal error during admin initialization:",
      error instanceof Error ? error.message : error
    );
  }
}
