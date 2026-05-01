import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { stripBasePath, withBasePath } from "@/lib/base-path";

const protectedRoutes = ["/dashboard", "/projects", "/admin", "/files", "/time-reports", "/diary"];
const adminRoutes = ["/admin", "/projects/new"];

function secret() {
  return new TextEncoder().encode(process.env.SESSION_SECRET || "lokal-utveckling-byt-denna-hemlighet-minst-32-tecken");
}

export async function middleware(request: NextRequest) {
  const pathname = stripBasePath(request.nextUrl.pathname);
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get("granix_session")?.value;
  if (!token) return NextResponse.redirect(new URL(withBasePath("/login"), request.url));

  try {
    const { payload } = await jwtVerify(token, secret());
    if (adminRoutes.some((route) => pathname.startsWith(route)) && payload.role !== "admin") {
      return NextResponse.redirect(new URL(withBasePath("/dashboard"), request.url));
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL(withBasePath("/login"), request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
