import { type NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const ok = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value,
    process.env.APP_PASSWORD,
  );
  if (ok) return NextResponse.next();

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }
  const login = new URL("/login", request.url);
  if (request.nextUrl.pathname !== "/") login.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/((?!login|_next/|favicon|icon|apple-icon|manifest).*)"],
};
