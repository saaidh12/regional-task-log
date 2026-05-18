import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const REGIONS = ["SPR", "SCPR", "NCPR", "NPR", "UNPR"] as const;
const STATUS = ["PENDING", "IN_PROGRESS", "COMPLETED", "CLOSED"] as const;

async function generateTaskNumber(region: string) {
  const year = new Date().getFullYear();

  const count = await prisma.task.count({
    where: {
      region: region as any,
      createdAt: {
        gte: new Date(`${year}-01-01T00:00:00.000Z`),
        lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
      },
    },
  });

  const nextNumber = String(count + 1).padStart(4, "0");

  return `${region}-${year}-${nextNumber}`;
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
    const regionFromBody = String(body.region || "").trim();
    const atoll = String(body.atoll || "").trim();
    const island = String(body.island || "").trim();
    const description = String(body.description || "").trim();
    const informationProvided = String(body.informationProvided || "").trim();
    const informationProvidedDate = String(
      body.informationProvidedDate || ""
    ).trim();
    const status = String(body.status || "PENDING").trim();

    const sharedToOptionIds = Array.isArray(body.sharedToOptionIds)
      ? body.sharedToOptionIds.map(String).filter(Boolean)
      : [];

    const requestTypeOptionIds = Array.isArray(body.requestTypeOptionIds)
      ? body.requestTypeOptionIds.map(String).filter(Boolean)
      : [];

    const region =
      session.role === "MAIN_ADMIN" ? regionFromBody : session.region;

    if (!date || !region || !atoll || !description) {
      return NextResponse.json(
        { error: "Please fill date, region, atoll and task description." },
        { status: 400 }
      );
    }

    if (!REGIONS.includes(region as any)) {
      return NextResponse.json(
        { error: "Invalid region selected." },
        { status: 400 }
      );
    }

    if (!STATUS.includes(status as any)) {
      return NextResponse.json(
        { error: "Invalid status selected." },
        { status: 400 }
      );
    }

    const taskNumber = await generateTaskNumber(region);

    const task = await prisma.task.create({
      data: {
        taskNumber,
        date: new Date(date),
        region: region as any,
        atoll,
        island: island || null,
        description,
        informationProvided,
        informationProvidedDate: informationProvidedDate
          ? new Date(informationProvidedDate)
          : null,
        status: status as any,
        createdByUserId: session.id,
        createdByName: session.fullName,
        createdByServiceNumber: session.serviceNumber,

        sharedToOptions: {
          create: sharedToOptionIds.map((sharedToOptionId: string) => ({
            sharedToOption: {
              connect: { id: sharedToOptionId },
            },
          })),
        },

        requestTypeOptions: {
          create: requestTypeOptionIds.map((requestTypeOptionId: string) => ({
            requestTypeOption: {
              connect: { id: requestTypeOptionId },
            },
          })),
        },
      },
    });

    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error("CREATE_TASK_ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong while saving task." },
      { status: 500 }
    );
  }
}