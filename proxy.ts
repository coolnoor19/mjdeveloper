import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/jwt";

const PUBLIC_ADMIN = ["/admin/login", "/admin/setup"];

/**
 * Keeps signed-out visitors out of the admin pages. This is a fast first gate only:
 * every /api/admin route checks the session again against the database.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  const isPublic = PUBLIC_ADMIN.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (!session && !isPublic) {
    const url = new URL("/admin/login", req.url);
    if (pathname !== "/admin") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  if (session && pathname === "/admin/login") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }
  const res = NextResponse.next();
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
