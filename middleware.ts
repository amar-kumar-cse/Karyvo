import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply API security checks to /api/* routes
  if (pathname.startsWith("/api")) {
    const origin = request.headers.get("origin");
    const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL || "*";

    // 1. Handle CORS Preflight OPTIONS requests
    if (request.method === "OPTIONS") {
      const response = new NextResponse(null, { status: 204 });
      response.headers.set("Access-Control-Allow-Origin", origin || allowedOrigin);
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With, x-user-id"
      );
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
    response.headers.set("Access-Control-Allow-Origin", origin || allowedOrigin);
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
