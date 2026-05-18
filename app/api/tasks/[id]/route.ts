import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const REGIONS = ["SPR", "SCPR", "NCPR", "NPR", "UNPR"] as const;
const STATUS = ["PENDING", "IN_PROGRESS", "COMPLETED", "CLOSED"] as const;

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

    const existingTask = await prisma.task.findUnique({
      where: { id },
      include: {
        sharedToOptions: true,
        requestTypeOptions: true,
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }

    if (session.role !== "MAIN_ADMIN") {
      if (existingTask.region !== session.region) {
        return NextResponse.json(
          { error: "You cannot edit another region's task." },
          { status: 403 }
        );
      }

      if (existingTask.createdByUserId !== session.id) {
        return NextResponse.json(
          { error: "You can only edit task records created by you." },
          { status: 403 }
        );
      }
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
    const status = String(body.status || "").trim();

    const sharedToOptionIds = Array.isArray(body.sharedToOptionIds)
      ? body.sharedToOptionIds.map(String).filter(Boolean)
      : [];

    const requestTypeOptionIds = Array.isArray(body.requestTypeOptionIds)
      ? body.requestTypeOptionIds.map(String).filter(Boolean)
      : [];

    const region =
      session.role === "MAIN_ADMIN" ? regionFromBody : existingTask.region;

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

    await prisma.taskSharedToOption.deleteMany({
      where: { taskId: id },
    });

    await prisma.taskRequestTypeOption.deleteMany({
      where: { taskId: id },
    });

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
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

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (error) {
    console.error("UPDATE_TASK_ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong while updating task." },
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
        { error: "Only Main Admin can delete task records." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE_TASK_ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong while deleting task." },
      { status: 500 }
    );
  }
}