import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PRIORITIES = ["NORMAL", "IMPORTANT", "URGENT"] as const;

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please login again." },
        { status: 401 }
      );
    }

    const { id } = await params;

    const existingInfo = await prisma.infoShare.findUnique({
      where: { id },
      include: {
        sharedToAreas: {
          include: {
            area: true,
          },
        },
      },
    });

    if (!existingInfo) {
      return NextResponse.json(
        { error: "Information record not found." },
        { status: 404 }
      );
    }

    const canEdit =
      session.role === "MAIN_ADMIN" ||
      existingInfo.createdByUserId === session.id;

    if (!canEdit) {
      return NextResponse.json(
        { error: "You cannot edit this information record." },
        { status: 403 }
      );
    }

    const body = await req.json();

    const date = String(body.date || "").trim();
    const title = String(body.title || "").trim();
    const details = String(body.details || "").trim();
    const source = String(body.source || "").trim();
    const remarks = String(body.remarks || "").trim();
    const priority = String(body.priority || "NORMAL").trim();

    const areaIds: string[] = Array.isArray(body.areaIds)
      ? body.areaIds
          .map((item: unknown) => String(item).trim())
          .filter((item: string) => item.length > 0)
      : [];

    if (!date || !title || !details) {
      return NextResponse.json(
        { error: "Please fill date, title and information details." },
        { status: 400 }
      );
    }

    if (!PRIORITIES.includes(priority as any)) {
      return NextResponse.json(
        { error: "Invalid priority selected." },
        { status: 400 }
      );
    }

    if (areaIds.length === 0) {
      return NextResponse.json(
        { error: "Please select at least one area to share." },
        { status: 400 }
      );
    }

    const allowedAreas = await prisma.infoShareArea.findMany({
      where: {
        id: {
          in: areaIds,
        },
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (allowedAreas.length === 0) {
      return NextResponse.json(
        { error: "No valid shared area selected." },
        { status: 400 }
      );
    }

    await prisma.infoShareToArea.deleteMany({
      where: {
        infoShareId: id,
      },
    });

    const info = await prisma.infoShare.update({
      where: { id },
      data: {
        date: new Date(date),
        title,
        details,
        source: source || null,
        remarks: remarks || null,
        priority: priority as any,

        sharedToAreas: {
          create: allowedAreas.map((area) => ({
            area: {
              connect: {
                id: area.id,
              },
            },
          })),
        },
      },
    });

    return NextResponse.json({ success: true, info });
  } catch (error) {
    console.error("UPDATE_INFORMATION_ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong while updating information." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session || session.role !== "MAIN_ADMIN") {
      return NextResponse.json(
        { error: "Only Main Admin can delete information records." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existingInfo = await prisma.infoShare.findUnique({
      where: { id },
    });

    if (!existingInfo) {
      return NextResponse.json(
        { error: "Information record not found." },
        { status: 404 }
      );
    }

    await prisma.infoShare.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Information record deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE_INFORMATION_ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong while deleting information." },
      { status: 500 }
    );
  }
}