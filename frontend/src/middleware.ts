import { NextResponse, NextRequest } from "next/server";

const PROTECTED_PATHS = ["/onboarding", "/discover", "/profile", "/matches", "/chat"];
const AUTH_PATHS = ["/login", "/signup"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("access_token")?.value
    // Fall back to localStorage isn't possible in middleware (server-side),
    // so we rely on the cookie if we set one. For now, skip enforcement
    // if no cookie is present (see note below).

  // ⚠️ Since we store tokens in localStorage (not cookies), middleware cannot
  // see them. This middleware works only AFTER we migrate to cookies.
  // For now, we do client-side protection via the AuthProvider + page checks.

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"],
};