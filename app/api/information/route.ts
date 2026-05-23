import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PRIORITIES = ["NORMAL", "IMPORTANT", "URGENT"] as const;

function generateInfoNumber() {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();

  return `INFO-${y}${m}${d}-${random}`;
}

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please login again." },
        { status: 401 }
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

    const info = await prisma.infoShare.create({
      data: {
        date: new Date(date),
        title,
        details,
        source: source || null,
        remarks: remarks || null,
        priority: priority as any,

        createdByUserId: session.id,
        createdByName: session.fullName,
        createdByServiceNumber: session.serviceNumber,
        createdByRegion: session.region as any,

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
    console.error("CREATE_INFORMATION_ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong while saving information." },
      { status: 500 }
    );
  }
}