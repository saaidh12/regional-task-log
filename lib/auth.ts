import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const COOKIE_NAME = "regional_task_session";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-this"
);

export type SessionUser = {
  id: string;
  fullName: string;
  serviceNumber: string;
  region: string | null;
  role: "MAIN_ADMIN" | "STAFF";
};

export async function signSession(user: SessionUser) {
  return await new SignJWT(user)
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

    const payload = verified.payload as Partial<SessionUser>;

    if (
      !payload.id ||
      !payload.fullName ||
      !payload.serviceNumber ||
      !payload.role
    ) {
      return null;
    }

    return {
      id: payload.id,
      fullName: payload.fullName,
      serviceNumber: payload.serviceNumber,
      region: payload.region ?? null,
      role: payload.role,
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