import { redirect } from "next/navigation";

import AppShell from "@/app/components/AppShell";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import YaumiyyaClient, { type YaumiyyaItem } from "./yaumiyya-client";

const PAGE_SIZE = 12;

export default async function YaumiyyaPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    region?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.id },
    select: { mustChangePassword: true },
  });

  if (dbUser?.mustChangePassword) {
    redirect("/change-password");
  }

  const params = await searchParams;

  const q = String(params.q || "").trim();
  const selectedRegion = String(params.region || "ALL");
  const from = String(params.from || "").trim();
  const to = String(params.to || "").trim();

  const currentPage = Math.max(Number(params.page || "1"), 1);
  const skip = (currentPage - 1) * PAGE_SIZE;

  const where: any = {};

  if (session.role === "MAIN_ADMIN") {
    if (selectedRegion !== "ALL") {
      where.region = selectedRegion;
    }
  } else {
    where.region = session.region;
  }

  if (from || to) {
    where.date = {};

    if (from) {
      where.date.gte = new Date(`${from}T00:00:00.000Z`);
    }

    if (to) {
      where.date.lte = new Date(`${to}T23:59:59.999Z`);
    }
  }

  if (q) {
    where.OR = [
      { meetingTitle: { contains: q } },
      { meetingNotes: { contains: q } },
      { assignedTasks: { contains: q } },
      { startTime: { contains: q } },
      { finishedTime: { contains: q } },
      { createdByName: { contains: q } },
      { createdByServiceNumber: { contains: q } },
      {
        participants: {
          some: {
            displayName: {
              contains: q,
            },
          },
        },
      },
      {
        assignedTaskItems: {
          some: {
            OR: [
              { assignedToName: { contains: q } },
              { assignedToServiceNo: { contains: q } },
              { taskDetails: { contains: q } },
            ],
          },
        },
      },
    ];
  }

  const [records, totalRecords] = await Promise.all([
    prisma.yaumiyyaRecord.findMany({
      where,
      orderBy: {
        date: "desc",
      },
      skip,
      take: PAGE_SIZE,
      include: {
        participants: {
          select: {
            id: true,
            displayName: true,
            serviceNo: true,
            region: true,
          },
        },
        assignedTaskItems: {
          orderBy: {
            createdAt: "asc",
          },
          select: {
            id: true,
            assignedToUserId: true,
            assignedToName: true,
            assignedToServiceNo: true,
            assignedToRegion: true,
            taskDetails: true,
            isCompleted: true,
          },
        },
      },
    }),

    prisma.yaumiyyaRecord.count({ where }),
  ]);

  const totalPages = Math.max(Math.ceil(totalRecords / PAGE_SIZE), 1);

  const safeRecords: YaumiyyaItem[] = records.map((record) => {
    const assignedTaskItems =
      record.assignedTaskItems.length > 0
        ? record.assignedTaskItems.map((task) => ({
            id: task.id,
            assignedToUserId: task.assignedToUserId || "",
            assignedToName: task.assignedToName,
            assignedToServiceNo: task.assignedToServiceNo || "",
            assignedToRegion: task.assignedToRegion || "",
            taskDetails: task.taskDetails,
            isCompleted: task.isCompleted,
          }))
        : record.assignedTasks
          ? [
              {
                id: `${record.id}-legacy-assigned-task`,
                assignedToUserId: "",
                assignedToName: "Unassigned",
                assignedToServiceNo: "",
                assignedToRegion: "",
                taskDetails: record.assignedTasks,
                isCompleted: false,
              },
            ]
          : [];

    return {
      id: record.id,
      date: record.date.toISOString(),
      startTime: record.startTime || "",
      finishedTime: record.finishedTime || "",
      region: record.region,
      meetingTitle: record.meetingTitle || "",
      meetingNotes: record.meetingNotes,
      assignedTasks: record.assignedTasks || "",
      createdByName: record.createdByName,
      createdByServiceNumber: record.createdByServiceNumber,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      participants: record.participants.map((participant) => ({
        id: participant.id,
        displayName: participant.displayName,
        serviceNo: participant.serviceNo || "",
        region: participant.region || "",
      })),
      assignedTaskItems,
    };
  });

  return (
    <AppShell
      title="Yaumiyya"
      subtitle={
        session.role === "MAIN_ADMIN"
          ? "Regional meeting notes"
          : `${session.region} meeting notes`
      }
      user={session}
    >
      <YaumiyyaClient
        records={safeRecords}
        session={{
          role: session.role,
          region: session.region,
        }}
        filters={{
          q,
          region: selectedRegion,
          from,
          to,
        }}
        pagination={{
          currentPage,
          totalPages,
          totalRecords,
          pageSize: PAGE_SIZE,
        }}
      />
    </AppShell>
  );
}