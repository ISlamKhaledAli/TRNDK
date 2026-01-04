import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET environment variable is required in production");
}
const ACTUAL_JWT_SECRET = JWT_SECRET || "super-secret-key-change-this-in-prod";
const SALT_ROUNDS = 10;

// Augment Express Request type to include user
declare global {
  namespace Express {
    interface User extends MapUser {}
    interface Request {
      user?: User;
    }
  }
}

type MapUser = Omit<User, "password">;

export function signToken(user: User): string {
  // Exclude password from token payload
  const { password, ...userWithoutPassword } = user;
  return jwt.sign(userWithoutPassword, ACTUAL_JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): MapUser | null {
  try {
    return jwt.verify(token, ACTUAL_JWT_SECRET) as MapUser;
  } catch (error) {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({ message: "Invalid token" });
  }

  req.user = user;
  next();
}
export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  authMiddleware(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }
    next();
  });
}
