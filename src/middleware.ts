import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Skip auth for public routes and static files
const PUBLIC_PATHS = new Set(["/login", "/api/auth"]);
const isPublic = (path: string) => PUBLIC_PATHS.has(path) || path.includes(".");

let authPromise: Promise<any> | null = null;

export async function middleware(request: NextRequest) {
  // Skip auth check for public paths
  if (isPublic(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Reuse existing auth promise if it exists
  authPromise = authPromise || auth();
  await authPromise;

  return NextResponse.next();
}

// Only run middleware where needed
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)", "/api/:path*"],
};
