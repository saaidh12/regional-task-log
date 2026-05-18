import { redirect } from "next/navigation";

import AppShell from "@/app/components/AppShell";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TaskRecordsClient, { type TaskItem } from "./task-records-client";

const PAGE_SIZE = 15;

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    region?: string;
    status?: string;
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
  const selectedStatus = String(params.status || "ALL");
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

  if (selectedStatus !== "ALL") {
    where.status = selectedStatus;
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
      { taskNumber: { contains: q } },
      { atoll: { contains: q } },
      { island: { contains: q } },
      { description: { contains: q } },
      { informationProvided: { contains: q } },
      { createdByName: { contains: q } },
      { createdByServiceNumber: { contains: q } },
    ];
  }

  const [tasks, totalTasks] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: PAGE_SIZE,
      include: {
        sharedToOptions: {
          include: {
            sharedToOption: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        requestTypeOptions: {
          include: {
            requestTypeOption: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    }),

    prisma.task.count({ where }),
  ]);

  const totalPages = Math.max(Math.ceil(totalTasks / PAGE_SIZE), 1);

  const safeTasks: TaskItem[] = tasks.map((task) => ({
    id: task.id,
    createdByUserId: task.createdByUserId,
    taskNumber: task.taskNumber,
    date: task.date.toISOString(),
    region: task.region,
    atoll: task.atoll,
    island: task.island || "",
    description: task.description,
    informationProvided: task.informationProvided,
    informationProvidedDate: task.informationProvidedDate
      ? task.informationProvidedDate.toISOString()
      : "",
    status: task.status,
    createdByName: task.createdByName,
    createdByServiceNumber: task.createdByServiceNumber,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    sharedToOptions: task.sharedToOptions.map((item) => ({
      id: item.sharedToOption.id,
      name: item.sharedToOption.name,
    })),
    requestTypeOptions: task.requestTypeOptions.map((item) => ({
      id: item.requestTypeOption.id,
      name: item.requestTypeOption.name,
    })),
  }));

  return (
    <AppShell
      title="Task Records"
      subtitle={
        session.role === "MAIN_ADMIN"
          ? "Viewing all regional records"
          : `Viewing ${session.region} records only`
      }
      user={session}
    >
      <TaskRecordsClient
        tasks={safeTasks}
        session={{
          id: session.id,
          role: session.role,
          region: session.region,
        }}
        filters={{
          q,
          region: selectedRegion,
          status: selectedStatus,
          from,
          to,
        }}
        pagination={{
          currentPage,
          totalPages,
          totalTasks,
          pageSize: PAGE_SIZE,
        }}
      />
    </AppShell>
  );
}