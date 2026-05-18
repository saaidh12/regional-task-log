import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session || session.role !== "MAIN_ADMIN") {
      return NextResponse.json(
        { error: "Only main admin can update user status." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const isActive = Boolean(body.isActive);

    if (id === session.id) {
      return NextResponse.json(
        { error: "You cannot disable your own admin login." },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        isActive,
        disabledAt: isActive ? null : new Date(),
      },
      select: {
        id: true,
        fullName: true,
        serviceNumber: true,
        username: true,
        region: true,
        role: true,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Could not update user status." },
      { status: 500 }
    );
  }
}