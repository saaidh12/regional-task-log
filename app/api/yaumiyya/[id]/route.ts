import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const existingRecord = await prisma.yaumiyyaRecord.findUnique({
      where: { id },
    });

    if (!existingRecord) {
      return NextResponse.json(
        { error: "Yaumiyya record not found." },
        { status: 404 }
      );
    }

    if (
      session.role !== "MAIN_ADMIN" &&
      existingRecord.region !== session.region
    ) {
      return NextResponse.json(
        { error: "You cannot edit another region's Yaumiyya record." },
        { status: 403 }
      );
    }

    const body = await req.json();

    const date = String(body.date || "").trim();
    const startTime = String(body.startTime || "").trim();
    const finishedTime = String(body.finishedTime || "").trim();
    const meetingTitle = String(body.meetingTitle || "").trim();
    const meetingNotes = String(body.meetingNotes || "").trim();

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

    const assignedTaskItems: {
      assignedToUserId?: string;
      assignedToName: string;
      assignedToServiceNo?: string;
      assignedToRegion?: string;
      taskDetails: string;
      isCompleted?: boolean;
    }[] = Array.isArray(body.assignedTaskItems)
      ? body.assignedTaskItems
          .map((item: unknown) => {
            const task = item as {
              assignedToUserId?: unknown;
              assignedToName?: unknown;
              assignedToServiceNo?: unknown;
              assignedToRegion?: unknown;
              taskDetails?: unknown;
              isCompleted?: unknown;
            };

            return {
              assignedToUserId: task.assignedToUserId
                ? String(task.assignedToUserId).trim()
                : undefined,
              assignedToName: String(task.assignedToName || "").trim(),
              assignedToServiceNo: task.assignedToServiceNo
                ? String(task.assignedToServiceNo).trim()
                : undefined,
              assignedToRegion: task.assignedToRegion
                ? String(task.assignedToRegion).trim()
                : undefined,
              taskDetails: String(task.taskDetails || "").trim(),
              isCompleted: Boolean(task.isCompleted),
            };
          })
          .filter(
            (item: { assignedToName: string; taskDetails: string }) =>
              item.assignedToName.length > 0 && item.taskDetails.length > 0
          )
      : [];

    if (!date || !meetingNotes) {
      return NextResponse.json(
        { error: "Please fill date and meeting notes." },
        { status: 400 }
      );
    }

    await prisma.yaumiyyaParticipant.deleteMany({
      where: { yaumiyyaId: id },
    });

    await prisma.yaumiyyaAssignedTask.deleteMany({
      where: { yaumiyyaId: id },
    });

    const record = await prisma.yaumiyyaRecord.update({
      where: { id },
      data: {
        date: new Date(date),
        startTime: startTime || null,
        finishedTime: finishedTime || null,
        meetingTitle: meetingTitle || null,
        meetingNotes,
        assignedTasks: null,

        participants: {
          create: participants.map((participant) => ({
            userId: participant.userId || null,
            displayName: participant.displayName,
            serviceNo: participant.serviceNo || null,
            region: participant.region ? (participant.region as any) : null,
          })),
        },

        assignedTaskItems: {
          create: assignedTaskItems.map((task) => ({
            assignedToUserId: task.assignedToUserId || null,
            assignedToName: task.assignedToName,
            assignedToServiceNo: task.assignedToServiceNo || null,
            assignedToRegion: task.assignedToRegion
              ? (task.assignedToRegion as any)
              : null,
            taskDetails: task.taskDetails,
            isCompleted: Boolean(task.isCompleted),
          })),
        },
      },
    });

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error("UPDATE_YAUMIYYA_ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong while updating Yaumiyya." },
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
        { error: "Only Main Admin can delete Yaumiyya records." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existingRecord = await prisma.yaumiyyaRecord.findUnique({
      where: { id },
    });

    if (!existingRecord) {
      return NextResponse.json(
        { error: "Yaumiyya record not found." },
        { status: 404 }
      );
    }

    await prisma.yaumiyyaRecord.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Yaumiyya record deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE_YAUMIYYA_ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong while deleting Yaumiyya." },
      { status: 500 }
    );
  }
}