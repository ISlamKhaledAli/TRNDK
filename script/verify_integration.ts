import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const BASE_URL = "http://localhost:5000/api/v1";
const prisma = new PrismaClient();

async function runTests() {
  console.log("🚀 Starting Deep Integration Verification...");

  // 1. Database Connection Check
  try {
    console.log("\n1️⃣  Testing Database Connection (Prisma Direct)...");
    const userCountStart = await prisma.user.count();
    console.log(`   ✅ Connected! Current user count: ${userCountStart}`);
  } catch (e) {
    console.error("   ❌ Failed to connect to DB via Prisma:", e);
    process.exit(1);
  }

  // 2. Health Check (API)
  try {
    console.log("\n2️⃣  Testing Health Endpoint (Should NOT fail)...");
    const healthRes = await fetch(`${BASE_URL}/health`);
    if (healthRes.ok) {
        const data = await healthRes.json();
        console.log("   ✅ Health Check Passed:", data);
    } else {
        throw new Error(`Health check failed: ${healthRes.status}`);
    }
  } catch (e) {
    console.error("   ❌ Health Check Failed:", e);
  }

  // 3. User Registration (API + DB Verification)
  const testEmail = `test_verification_${Date.now()}@example.com`;
  const testPassword = "password123";
  let authToken = "";

  try {
    console.log("\n3️⃣  Testing User Registration (API)...");
    const regRes = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Verification User",
        email: testEmail,
        password: testPassword,
        role: "customer"
      }),
    });

    if (regRes.ok) {
      const data = await regRes.json();
      console.log(`   ✅ Registration Successful! API Response ID: ${data.user.id}`);
      
      // Extract cookie manually since we aren't in a browser
      const cookieHeader = regRes.headers.get("set-cookie");
      if (cookieHeader) {
          authToken = cookieHeader.split(";")[0]; // primitive parsing
      }

      // Verify in DB
      const dbUser = await prisma.user.findUnique({ where: { email: testEmail } });
      if (dbUser) {
        console.log(`   ✅ Persistence Confirmed! User found in MySQL: ${dbUser.email} (ID: ${dbUser.id})`);
      } else {
        console.error("   ❌ Persistence FAILED! User not found in database.");
      }
    } else {
      const err = await regRes.text();
      console.error(`   ❌ Registration Failed: ${regRes.status}`, err);
    }
  } catch (e) {
    console.error("   ❌ Registration Test Error:", e);
  }

  // 4. Login & Data Retrieval
  try {
    console.log("\n4️⃣  Testing Login & Profile (Data Retrieval)...");
    // If registration gave us a token, stick with it, but let's test explicit login too
    const loginRes = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail, password: testPassword }),
    });

    if (loginRes.ok) {
        const data = await loginRes.json();
        console.log("   ✅ Login Successful:", data.user.email);
        const cookieHeader = loginRes.headers.get("set-cookie");
        if (cookieHeader) {
            authToken = cookieHeader.split(";")[0];
        }

        // Fetch Profile
        const profileRes = await fetch(`${BASE_URL}/profile`, {
            headers: { 
                "Cookie": authToken 
            }
        });
        if (profileRes.ok) {
            const profile = await profileRes.json();
            console.log("   ✅ Profile Retrieved from DB:", profile.data.email);
            if (profile.data.email !== testEmail) throw new Error("Profile email mismatch");
        } else {
            console.error("   ❌ Profile Fetch Failed:", await profileRes.text());
        }

    } else {
        console.error("   ❌ Login Failed:", await loginRes.text());
    }
  } catch (e) {
    console.error("   ❌ Login Test Error:", e);
  }

  // 5. Admin Dashboard (Data Flow)
  try {
      console.log("\n5️⃣  Testing Admin Dashboard (Data Aggregation)...");
      // Log in as seeded admin
      const adminLoginRes = await fetch(`${BASE_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "admin@example.com", password: "password" }),
      });
      
      if (adminLoginRes.ok) {
          const cookieHeader = adminLoginRes.headers.get("set-cookie");
          const adminToken = cookieHeader?.split(";")[0] || "";

          const dashboardRes = await fetch(`${BASE_URL}/dashboard/admin`, {
              headers: { "Cookie": adminToken }
          });

          if (dashboardRes.ok) {
              const stats = await dashboardRes.json();
              console.log("   ✅ Admin Stats Retrieved:", stats.data.totalUsers, "Total Users");
              if (stats.data.totalUsers < 2) console.warn("   ⚠️ Warning: User count seems low?");
          } else {
              console.error("   ❌ Admin Dashboard Failed:", await dashboardRes.text());
          }
      } else {
          console.error("   ❌ Admin Login Failed (Seeded credentials wrong?)");
      }

  } catch (e) {
      console.error("   ❌ Admin Test Error:", e);
  }

  console.log("\n🏁 Verification Complete.");
  await prisma.$disconnect();
}

runTests();
