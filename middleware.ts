import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "./src/lib/auth";

const unprotectedRoutes = ["/auth/login", "/"];

// Objek untuk memetakan peran (role) ke jalur dashboard yang sesuai
const roleRedirects = {
  super_admin: "/dashboard/admin",
  admin: "/dashboard/admin",
  rw: "/dashboard/rw",
  rt: "/dashboard/rt",
  user: "/dashboard",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSession(request);
  const isProtected = !unprotectedRoutes.includes(pathname);

  // Jika pengguna mencoba mengakses halaman login dan sudah terotentikasi,
  // arahkan ke dashboard yang sesuai dengan peran mereka.
  if (session && pathname.startsWith("/auth/login")) {
    const dashboardPath =
      roleRedirects[session.user.role as keyof typeof roleRedirects] ||
      "/dashboard";
    return NextResponse.redirect(new URL(dashboardPath, request.url));
  }

  // Jika pengguna mencoba mengakses halaman terproteksi dan tidak terotentikasi,
  // arahkan ke halaman login.
  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

// Konfigurasi matcher untuk menentukan rute mana yang akan diproses oleh middleware
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
