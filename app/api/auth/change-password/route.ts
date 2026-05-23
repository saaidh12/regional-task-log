import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return jsonNoStore(
        { error: "Unauthorized. Please login again." },
        401
      );
    }

    const body = await req.json();

    const currentPasswordRaw = String(body.currentPassword || "");
    const newPasswordRaw = String(body.newPassword || "");
    const confirmPasswordRaw = String(body.confirmPassword || "");

    const currentPassword = currentPasswordRaw.trim();
    const newPassword = newPasswordRaw.trim();
    const confirmPassword = confirmPasswordRaw.trim();

    if (!currentPassword || !newPassword || !confirmPassword) {
      return jsonNoStore(
        { error: "Please fill all password fields." },
        400
      );
    }

    if (newPassword.length < 6) {
      return jsonNoStore(
        { error: "New password must be at least 6 characters." },
        400
      );
    }

    if (newPassword !== confirmPassword) {
      return jsonNoStore(
        { error: "New password and confirm password do not match." },
        400
      );
    }

    if (currentPassword === newPassword) {
      return jsonNoStore(
        { error: "New password must be different from current password." },
        400
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        passwordHash: true,
        isActive: true,
      },
    });

    if (!user) {
      return jsonNoStore({ error: "User not found." }, 404);
    }

    if (!user.isActive) {
      return jsonNoStore(
        { error: "This login has been disabled. Contact Main Admin." },
        403
      );
    }

    const currentPasswordOk =
      (await bcrypt.compare(currentPasswordRaw, user.passwordHash)) ||
      (await bcrypt.compare(currentPassword, user.passwordHash));

    if (!currentPasswordOk) {
      return jsonNoStore(
        { error: "Current password is incorrect." },
        401
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: session.id },
      data: {
        passwordHash,
        mustChangePassword: false,
      },
    });

    return jsonNoStore({
      success: true,
      message: "Password changed successfully.",
      redirectTo: "/dashboard",
    });
  } catch (error) {
    console.error("CHANGE_PASSWORD_ERROR:", error);

    return jsonNoStore(
      { error: "Something went wrong while changing password." },
      500
    );
  }
}

function jsonNoStore(data: unknown, status = 200) {
  const response = NextResponse.json(data, { status });

  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  return response;
}