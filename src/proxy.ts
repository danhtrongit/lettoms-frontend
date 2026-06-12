import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth/auth.config";

const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
  const { nextUrl } = req;
  const user = req.auth?.user;
  const role = user?.role;
  const isLoggedIn = !!user;
  const isStaff = role === "admin" || role === "staff";

  const path = nextUrl.pathname;

  // Admin area: staff/admin only
  if (path.startsWith("/admin")) {
    if (!isLoggedIn) {
      const url = new URL("/dang-nhap", nextUrl);
      url.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(url);
    }
    if (!isStaff) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  // Draft preview: staff/admin only
  if (path.startsWith("/xem-truoc")) {
    if (!isLoggedIn) {
      const url = new URL("/dang-nhap", nextUrl);
      url.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(url);
    }
    if (!isStaff) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  // Customer account area: any logged-in user
  if (path.startsWith("/tai-khoan")) {
    if (!isLoggedIn) {
      const url = new URL("/dang-nhap", nextUrl);
      url.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(url);
    }
  }

  // Already logged in → bounce away from auth pages
  if ((path === "/dang-nhap" || path === "/dang-ky") && isLoggedIn) {
    return NextResponse.redirect(new URL(isStaff ? "/admin" : "/tai-khoan", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/tai-khoan/:path*", "/dang-nhap", "/dang-ky", "/xem-truoc/:path*"],
};
