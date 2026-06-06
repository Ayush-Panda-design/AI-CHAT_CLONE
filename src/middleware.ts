import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/auth/login", "/auth/register", "/auth/forgot-password"];
const API_PUBLIC = ["/api/auth/login", "/api/auth/register", "/api/auth/refresh", "/api/auth/google"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.includes(pathname) || API_PUBLIC.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow static assets
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  // For API routes (except public), check authorization header at route level
  if (pathname.startsWith("/api/")) return NextResponse.next();

  // For app routes, let client handle auth redirect
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
