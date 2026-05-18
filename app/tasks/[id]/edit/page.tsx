import Link from "next/link";
import { redirect } from "next/navigation";

import AppShell from "@/app/components/AppShell";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EditTaskForm from "./edit-task-form";

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
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

  const { id } = await params;

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      sharedToOptions: {
        select: {
          sharedToOptionId: true,
        },
      },
      requestTypeOptions: {
        select: {
          requestTypeOptionId: true,
        },
      },
    },
  });

  if (!task) {
    redirect("/tasks");
  }

  if (session.role !== "MAIN_ADMIN") {
    if (task.region !== session.region || task.createdByUserId !== session.id) {
      redirect("/tasks");
    }
  }

  const [sharedToOptions, requestTypeOptions] = await Promise.all([
    prisma.sharedToOption.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    }),

    prisma.requestTypeOption.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  const safeTask = {
    id: task.id,
    taskNumber: task.taskNumber,
    date: task.date.toISOString().slice(0, 10),
    region: task.region,
    atoll: task.atoll,
    island: task.island || "",
    description: task.description,
    informationProvided: task.informationProvided,
    informationProvidedDate: task.informationProvidedDate
      ? task.informationProvidedDate.toISOString().slice(0, 10)
      : "",
    status: task.status,
    selectedSharedToIds: task.sharedToOptions.map(
      (item) => item.sharedToOptionId
    ),
    selectedRequestTypeIds: task.requestTypeOptions.map(
      (item) => item.requestTypeOptionId
    ),
  };

  return (
    <AppShell
      title="Edit Task"
      subtitle={task.taskNumber}
      user={session}
    >
      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <div className="mb-5 flex items-center justify-between gap-3 lg:hidden">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Edit Task</h1>
            <p className="text-sm font-semibold text-slate-500">
              {task.taskNumber}
            </p>
          </div>

          <Link
            href="/tasks"
            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white"
          >
            Back
          </Link>
        </div>

        <EditTaskForm
          task={safeTask}
          userRole={session.role}
          userRegion={session.region}
          sharedToOptions={sharedToOptions}
          requestTypeOptions={requestTypeOptions}
        />
      </section>
    </AppShell>
  );
}