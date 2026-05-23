import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const REGIONS = ["SPR", "SCPR", "NCPR", "NPR", "UNPR"] as const;

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
    const startTime = String(body.startTime || "").trim();
    const finishedTime = String(body.finishedTime || "").trim();
    const regionFromBody = String(body.region || "").trim();
    const meetingTitle = String(body.meetingTitle || "").trim();
    const meetingNotes = String(body.meetingNotes || "").trim();
    const assignedTasks = String(body.assignedTasks || "").trim();

    const participants: {
      userId?: string;
      displayName: string;
      serviceNo?: string;
      region?: string;
    }[] = Array.isArray(body.participants)
      ? body.participants
          .map((item: unknown) => {
            const participant = item as {
              userId?: unknown;
              displayName?: unknown;
              serviceNo?: unknown;
              region?: unknown;
            };

            return {
              userId: participant.userId
                ? String(participant.userId).trim()
                : undefined,
              displayName: String(participant.displayName || "").trim(),
              serviceNo: participant.serviceNo
                ? String(participant.serviceNo).trim()
                : undefined,
              region: participant.region
                ? String(participant.region).trim()
                : undefined,
            };
          })
          .filter(
            (item: { displayName: string }) => item.displayName.length > 0
          )
      : [];

    /*
      Yaumiyya belongs to the whole regional meeting record.
      Staff: saved under their own region.
      Main Admin: if no region is selected, fallback to NPR.
      Region is used only internally for permission/filtering.
    */
    const region = session.region || regionFromBody || "NPR";

    if (!date || !region || !meetingNotes) {
      return NextResponse.json(
        { error: "Please fill date and meeting notes." },
        { status: 400 }
      );
    }

    if (!REGIONS.includes(region as any)) {
      return NextResponse.json(
        { error: "Invalid region selected." },
        { status: 400 }
      );
    }

    const record = await prisma.yaumiyyaRecord.create({
      data: {
        date: new Date(date),
        startTime: startTime || null,
        finishedTime: finishedTime || null,
        region: region as any,
        meetingTitle: meetingTitle || null,
        meetingNotes,
        assignedTasks: assignedTasks || null,

        createdByUserId: session.id,
        createdByName: session.fullName,
        createdByServiceNumber: session.serviceNumber,

        participants: {
          create: participants.map((participant) => ({
            userId: participant.userId || null,
            displayName: participant.displayName,
            serviceNo: participant.serviceNo || null,
            region: participant.region ? (participant.region as any) : null,
          })),
        },
      },
    });

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error("CREATE_YAUMIYYA_ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong while saving Yaumiyya." },
      { status: 500 }
    );
  }
}