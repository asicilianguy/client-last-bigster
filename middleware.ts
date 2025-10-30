import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Se l'utente accede alla root "/", reindirizza a "/login"
  if (request.nextUrl.pathname === "/") {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Per tutti gli altri path, prosegui normalmente
  return NextResponse.next();
}

// Configura il matcher per intercettare solo la root
export const config = {
  matcher: "/",
};
