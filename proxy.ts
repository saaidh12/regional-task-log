import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "regional_task_session";

const PROTECTED_PATHS = [
  "/dashboard",
  "/tasks",
  "/information",
  "/yaumiyya",
  "/database",
  "/reports",
  "/settings",
  "/support",
  "/users",
  "/change-password",
];

const ADMIN_ONLY_PATHS = ["/users", "/settings", "/reports/exports"];

const PUBLIC_PATHS = ["/"];

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-this"
);

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublicPath = PUBLIC_PATHS.includes(pathname);
  const isProtectedPath = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;

  if (isPublicPath && session) {
    return noStoreRedirect(new URL("/dashboard", req.url));
  }

  if (isProtectedPath && !session) {
    return noStoreRedirect(new URL("/", req.url));
  }

  const isAdminOnly = ADMIN_ONLY_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (isAdminOnly && session?.role !== "MAIN_ADMIN") {
    return noStoreRedirect(new URL("/dashboard", req.url));
  }

  const response = NextResponse.next();

  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  return response;
}

async function verifySession(token: string) {
  try {
    const verified = await jwtVerify(token, secret);
    const payload = verified.payload;

    const id = typeof payload.id === "string" ? payload.id : "";
    const fullName =
      typeof payload.fullName === "string" ? payload.fullName : "";
    const serviceNumber =
      typeof payload.serviceNumber === "string" ? payload.serviceNumber : "";
    const role = payload.role;
    const region =
      typeof payload.region === "string" ? payload.region : null;

    if (!id || !fullName || !serviceNumber) {
      return null;
    }

    if (role !== "MAIN_ADMIN" && role !== "STAFF") {
      return null;
    }

    return {
      id,
      fullName,
      serviceNumber,
      role,
      region,
    };
  } catch {
    return null;
  }
}

function noStoreRedirect(url: URL) {
  const response = NextResponse.redirect(url);

  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  return response;
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/tasks/:path*",
    "/information/:path*",
    "/yaumiyya/:path*",
    "/database/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/support/:path*",
    "/users/:path*",
    "/change-password/:path*",
  ],
};