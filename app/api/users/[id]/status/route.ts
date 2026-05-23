import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "You are not logged in." },
        { status: 401 }
      );
    }

    if (session.role !== "MAIN_ADMIN") {
      return NextResponse.json(
        { error: "Only Main Admin can update user status." },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "User ID is missing." },
        { status: 400 }
      );
    }

    if (id === session.id) {
      return NextResponse.json(
        { error: "You cannot disable your own admin login." },
        { status: 400 }
      );
    }

    const body = await req.json();

    if (typeof body.isActive !== "boolean") {
      return NextResponse.json(
        { error: "Invalid status value." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        isActive: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isActive: body.isActive,
        disabledAt: body.isActive ? null : new Date(),
      },
      select: {
        id: true,
        fullName: true,
        serviceNumber: true,
        username: true,
        region: true,
        role: true,
        isActive: true,
        disabledAt: true,
      },
    });

    revalidatePath("/users");

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("USER_STATUS_UPDATE_ERROR", error);

    return NextResponse.json(
      { error: "Could not update user status. Check server logs." },
      { status: 500 }
    );
  }
}