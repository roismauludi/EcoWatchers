import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Daftar path yang tidak memerlukan autentikasi
const publicPaths = ["/example/login", "/example/create-account"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Jika path adalah public path, biarkan akses
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Cek token dari cookie
  const token = request.cookies.get("token");

  if (!token) {
    // Redirect ke halaman login jika tidak ada token
    const url = new URL("/example/login", request.url);
    return NextResponse.redirect(url);
  }

  // Lanjutkan ke halaman yang diminta jika ada token
  return NextResponse.next();
}

// Konfigurasi path yang akan dijalankan middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|assets).*)",
  ],
};
