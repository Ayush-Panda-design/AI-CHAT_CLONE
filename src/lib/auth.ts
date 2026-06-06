import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

interface JWTPayload { userId: string; email?: string; iat?: number; exp?: number; }

export function verifyAuth(req: NextRequest): JWTPayload | null {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.startsWith("Bearer ") ? auth.split(" ")[1] : null;
    if (!token) return null;
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
  } catch {
    return null;
  }
}

export function signAccessToken(userId: string, email: string) {
  return jwt.sign({ userId, email }, process.env.JWT_SECRET!, { expiresIn: "15m" });
}

export function signRefreshToken(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, { expiresIn: "7d" });
}
