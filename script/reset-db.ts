import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database reset...");

  try {
    // Orders depend on Users, Services, and Affiliates
    // Payments depend on Orders
    // Notifications depend on Orders
    // Reviews depend on Services and Users
    
    console.log("Deleting reviews...");
    await prisma.review.deleteMany({});

    console.log("Deleting notifications...");
    await prisma.notification.deleteMany({});

    console.log("Deleting payments...");
    await prisma.payment.deleteMany({});

    console.log("Deleting orders...");
    await prisma.order.deleteMany({});

    console.log("Deleting affiliates...");
    await prisma.affiliate.deleteMany({});

    console.log("Deleting services...");
    await prisma.service.deleteMany({});

    console.log("Deleting non-admin users...");
    const { count: userCount } = await prisma.user.deleteMany({
      where: {
        role: {
          not: "admin"
        }
      }
    });
    console.log(`Deleted ${userCount} non-admin users.`);

    // Keep settings as they might be system configurations
    // But if you want to delete them too:
    // console.log("Deleting settings...");
    // await prisma.setting.deleteMany({});

    console.log("Database reset complete.");
  } catch (error) {
    console.error("Error resetting database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
