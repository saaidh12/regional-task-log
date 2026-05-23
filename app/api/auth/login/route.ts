import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { COOKIE_NAME, signSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const username = String(body.username || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!username || !password) {
      return jsonNoStore(
        { error: "Username and password are required." },
        400
      );
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return jsonNoStore(
        { error: "Invalid username or password." },
        401
      );
    }

    if (!user.isActive) {
      return jsonNoStore(
        { error: "This login has been disabled. Contact Main Admin." },
        403
      );
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash);

    if (!passwordOk) {
      return jsonNoStore(
        { error: "Invalid username or password." },
        401
      );
    }

    const token = await signSession({
      id: user.id,
      fullName: user.fullName,
      serviceNumber: user.serviceNumber,
      region: user.region,
      role: user.role,
    });

    const mustChangePassword = Boolean(user.mustChangePassword);

    const response = NextResponse.json({
      success: true,
      mustChangePassword,
      redirectTo: mustChangePassword ? "/change-password" : "/dashboard",
      user: {
        fullName: user.fullName,
        serviceNumber: user.serviceNumber,
        region: user.region,
        role: user.role,
      },
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  } catch (error) {
    console.error("LOGIN_ERROR:", error);

    return jsonNoStore(
      { error: "Something went wrong while logging in." },
      500
    );
  }
}

function jsonNoStore(data: unknown, status: number) {
  const response = NextResponse.json(data, { status });

  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  return response;
}
