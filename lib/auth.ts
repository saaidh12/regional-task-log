import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const COOKIE_NAME = "regional_task_session";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-this";

const secret = new TextEncoder().encode(JWT_SECRET);

export type SessionUser = {
  id: string;
  fullName: string;
  serviceNumber: string;
  region: string | null;
  role: "MAIN_ADMIN" | "STAFF";
};

export async function signSession(user: SessionUser) {
  return await new SignJWT({
    id: user.id,
    fullName: user.fullName,
    serviceNumber: user.serviceNumber,
    region: user.region,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const verified = await jwtVerify(token, secret);
    const payload = verified.payload;

    const id = typeof payload.id === "string" ? payload.id : "";
    const fullName =
      typeof payload.fullName === "string" ? payload.fullName : "";
    const serviceNumber =
      typeof payload.serviceNumber === "string" ? payload.serviceNumber : "";
    const region =
      typeof payload.region === "string" ? payload.region : null;
    const role = payload.role;

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
      region,
      role,
    };
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getSession();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

export async function requireMainAdmin() {
  const user = await requireUser();

  if (user.role !== "MAIN_ADMIN") {
    throw new Error("Forbidden");
  }

  return user;
}

export function noStoreHeaders() {
  return {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  };
}