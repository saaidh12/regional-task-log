import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session || session.role !== "MAIN_ADMIN") {
      return NextResponse.json(
        { error: "Only main admin can reset passwords." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    const newPassword = String(body.newPassword || "").trim();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
  where: { id },
  data: {
    passwordHash,
    mustChangePassword: true,
  },
})

    return NextResponse.json({
      success: true,
      message: "Password reset successfully.",
    });
  } catch (error) {
    console.error("RESET_PASSWORD_ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong while resetting password." },
      { status: 500 }
    );
  }
}