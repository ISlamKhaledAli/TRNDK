/**
 * prisma/seed.ts
 * 
 * Database seeding script.
 * Populates the database with initial data including:
 * - Admin user
 * - Sample customers
 * - Sample services (Instagram, Facebook, TikTok, YouTube)
 */

import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Seed Admin
  const adminEmail = "admin@example.com";
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Islam Khaled",
      email: adminEmail,
      password: hashSync("password", 10),
      role: "admin",
      status: "active",
      isVip: true,
    },
  });
  console.log(`Admin created: ${admin.email}`);

  // Seed Customers
  for (let i = 1; i <= 5; i++) {
    const email = `customer${i}@example.com`;
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        name: `Customer ${i}`,
        email,
        password: hashSync("password", 10),
        role: "customer",
        phone: `+966501234${500 + i}`,
        status: i === 3 ? "suspended" : "active",
        isVip: i % 2 === 1,
      },
    });
  }
  console.log("Customers seeded");

  // Seed Services
  const services = [
    {
      name: "Instagram Followers",
      description: "High quality Instagram followers with fast delivery",
      price: 500,
      category: "Instagram",
      duration: "1-2 hours",
      imagePath: "https://images.unsplash.com/photo-1611267254323-4db7b39c732c?w=400&h=400&fit=crop",
    },
    {
      name: "Facebook Page Likes",
      description: "Organic Facebook page likes to boost your social proof",
      price: 800,
      category: "Facebook",
      duration: "6-12 hours",
      imagePath: "https://images.unsplash.com/photo-1543269865-cbf427ffebad?w=400&h=400&fit=crop",
    },
    {
      name: "TikTok Views",
      description: "Instant TikTok views for your latest videos",
      price: 200,
      category: "TikTok",
      duration: "15-30 minutes",
      imagePath: "https://images.unsplash.com/photo-1598128558393-70ff21433be0?w=400&h=400&fit=crop",
    },
    {
      name: "YouTube Subscribers",
      description: "Real YouTube subscribers to grow your channel",
      price: 1500,
      category: "YouTube",
      duration: "24-48 hours",
      imagePath: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=400&fit=crop",
    },
  ];

  for (const s of services) {
    // Check if exists by name to avoid duplicates on re-seed (rough check)
    const existing = await prisma.service.findFirst({ where: { name: s.name } });
    if (!existing) {
      await prisma.service.create({ data: s });
    }
  }
  console.log("Services seeded");

  console.log("Database seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
