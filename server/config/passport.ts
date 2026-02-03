/**
 * server/config/passport.ts
 * 
 * Passport.js configuration for Google OAuth 2.0 authentication.
 * Handles user authentication via Google Sign-In, account linking by email,
 * and automatic user creation for new Google accounts.
 */

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { storage } from "../storage/storage";
import { hashSync } from "bcryptjs";

export function setupPassport() {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientID || !clientSecret) {
    console.error("[Passport] GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing!");
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        // callbackURL: "/auth/google/callback",
        callbackURL: "https://store.trndk.com/auth/google/callback",
        state: false
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const googleId = profile.id;
          const email = profile.emails?.[0].value;
          const name = profile.displayName || email?.split("@")[0] || "Google User";

          console.log("[Passport] Profile received:", { googleId, email, name });

          if (!email) {
            console.error("[Passport] No email found in Google profile");
            return done(new Error("No email found in Google profile"));
          }

          // 1. Find by Google ID
          console.log("[Passport] Searching for user by Google ID:", googleId);
          let user = await storage.getUserByGoogleId(googleId);
          if (user) {
            console.log("[Passport] User found by Google ID:", user.email);
            return done(null, user);
          }

          // 2. Find by Email to link accounts
          console.log("[Passport] Searching for user by email:", email);
          user = await storage.getUserByEmail(email);
          if (user) {
            console.log("[Passport] User found by email, linking Google ID:", email);
            const updateResult = await storage.updateUser(user.id, { googleId });
            if (updateResult.success && updateResult.data) {
              return done(null, updateResult.data);
            }
            // If update fails but user exists, still log them in but maybe without linking?
            // Better to link, but let's at least return the user
            return done(null, user);
          }

          // 3. Create new user
          console.log("[Passport] Creating new user:", { email, name });
          const result = await storage.createUser({
            name,
            email,
            password: hashSync(Math.random().toString(36).slice(-10), 10),
            role: "customer",
            googleId,
          });

          if (!result.success) {
            console.error("[Passport] Failed to create user:", result.error);
            return done(new Error(result.error || "Failed to create user"));
          }

          console.log("[Passport] New user created successfully:", result.data?.email);
          return done(null, result.data);
        } catch (error) {
          console.error("[Passport] Catch error:", error);
          return done(error as Error);
        }
      }
    )
  );

  // Passport session support (minimal, as we use JWT)
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
}
