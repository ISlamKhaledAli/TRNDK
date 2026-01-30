
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  console.log("Testing connection with DATABASE_URL:", process.env.DATABASE_URL);
  try {
    await prisma.$connect();
    console.log("✅ Success! Connected to the database.");
    
    // Try a simple query
    const tableNames = await prisma.$queryRaw`SHOW TABLES`;
    console.log("Tables found:", tableNames);
    
  } catch (error: any) {
    console.error("❌ Connection Failed!");
    console.error("Error Message:", error.message);
    console.error("Error Code:", error.code);
    console.error("Full Error:", JSON.stringify(error, null, 2));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
