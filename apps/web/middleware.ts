import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";

const PUBLIC_PATHS = ["/", "/login", "/auth/callback"];
const RESERVED = new Set([
  "admin",
  "api",
  "auth",
  "login",
  "signup",
  "join",
  "_next",
  "favicon.ico",
  "manifest.json",
  "sw.js",
  "icons",
]);

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(getSupabaseUrl(), getSupabasePublishableKey(), {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return supabaseResponse;
  }

  if (pathname === "/login" && user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];

  if (firstSegment && !RESERVED.has(firstSegment) && !PUBLIC_PATHS.includes(pathname)) {
    const societySlug = firstSegment;
    const subPath = segments.slice(1);

    const protectedPaths = [
      "dashboard",
      "directory",
      "announcements",
      "emergency",
      "services",
      "profile",
      "admin",
    ];

    const isProtected = subPath.some((p) => protectedPaths.includes(p)) ||
      (subPath.length === 0 && segments.length === 1);

    if (isProtected && subPath[0] !== "join" && pathname !== `/${societySlug}`) {
      if (!user) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    supabaseResponse.headers.set("x-society-slug", societySlug);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
