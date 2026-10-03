import { NextResponse, type NextRequest } from "next/server";
import { updateSession, withSessionCookies } from "@/lib/supabase/middleware";
import { isAuthPage, isDemoMode, isProtectedPath, safeNextPath } from "@/lib/auth/config";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ---------------------------------------------------------------------------
  // API routes: CORS + content-type checks + security headers.
  // (Authentication for API routes is enforced inside each route via getUser().)
  // ---------------------------------------------------------------------------
  if (pathname.startsWith("/api")) {
    const origin = request.headers.get("origin");
    // Determine safe allowed origin
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    let allowedOrigin = "*";
    if (appUrl) {
      try {
        const parsedApp = new URL(appUrl);
        if (origin) {
          const parsedOrigin = new URL(origin);
          if (
            parsedOrigin.origin === parsedApp.origin ||
            parsedOrigin.hostname === "localhost" ||
            parsedOrigin.hostname === "127.0.0.1"
          ) {
            allowedOrigin = origin;
          } else {
            allowedOrigin = parsedApp.origin;
          }
        } else {
          allowedOrigin = parsedApp.origin;
        }
      } catch {
        allowedOrigin = appUrl;
      }
    } else if (origin) {
      // In local dev without NEXT_PUBLIC_APP_URL, allow localhost origin
      try {
        const parsedOrigin = new URL(origin);
        if (parsedOrigin.hostname === "localhost" || parsedOrigin.hostname === "127.0.0.1") {
          allowedOrigin = origin;
        }
      } catch {
        allowedOrigin = "*";
      }
    }

    // 1. Handle CORS Preflight OPTIONS requests
    if (request.method === "OPTIONS") {
      const response = new NextResponse(null, { status: 204 });
      response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
      response.headers.set("Access-Control-Max-Age", "86400");
      return response;
    }

    // 2. Validate Content-Type for state-modifying requests with a payload
    if (["POST", "PUT", "PATCH"].includes(request.method)) {
      const contentType = request.headers.get("content-type");
      const contentLength = request.headers.get("content-length");
      const hasBody = contentLength ? parseInt(contentLength, 10) > 0 : true;

      const isJson = contentType?.includes("application/json");
      const isMultipart = contentType?.includes("multipart/form-data");

      if (hasBody && (!contentType || (!isJson && !isMultipart))) {
        return NextResponse.json(
          { success: false, error: "Unsupported Media Type. Content-Type must be application/json or multipart/form-data." },
          { status: 415 }
        );
      }
    }

    // 3. Continue request and append standard Security Headers
    const response = NextResponse.next();
    response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com; connect-src 'self' https://*.supabase.co https://api.razorpay.com https://generativelanguage.googleapis.com;"
    );
    if (process.env.NODE_ENV === "production") {
      response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    }

    return response;
  }

  // ---------------------------------------------------------------------------
  // Pages: refresh the Supabase session and guard private routes.
  // ---------------------------------------------------------------------------
  if (isDemoMode()) {
    return NextResponse.next();
  }

  const { response, user } = await updateSession(request);

  // Signed-out users cannot open private pages.
  if (!user && isProtectedPath(pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("next", safeNextPath(`${pathname}${request.nextUrl.search}`));
    return withSessionCookies(response, NextResponse.redirect(loginUrl));
  }

  // Signed-in users do not need the login / signup screens.
  if (user && isAuthPage(pathname)) {
    const target = new URL(safeNextPath(request.nextUrl.searchParams.get("next")), request.url);
    return withSessionCookies(response, NextResponse.redirect(target));
  }

  return response;
}

export const config = {
  // Run on pages and API routes, skip Next.js internals and static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)"],
};
