import Link from "next/link";
import { redirect } from "next/navigation";

import AppShell from "@/app/components/AppShell";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EditYaumiyyaForm from "./edit-yaumiyya-form";

export default async function EditYaumiyyaPage({
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

  const record = await prisma.yaumiyyaRecord.findUnique({
    where: { id },
    include: {
      participants: {
        select: {
          id: true,
          userId: true,
          displayName: true,
          serviceNo: true,
          region: true,
        },
      },
      assignedTaskItems: {
        orderBy: { createdAt: "asc" },
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
  });

  if (!record) {
    redirect("/yaumiyya");
  }

  if (session.role !== "MAIN_ADMIN" && record.region !== session.region) {
    redirect("/yaumiyya");
  }

  const users = await prisma.user.findMany({
    where:
      session.role === "MAIN_ADMIN"
        ? { isActive: true }
        : { isActive: true, region: session.region as any },
    orderBy: { fullName: "asc" },
    select: {
      id: true,
      fullName: true,
      serviceNumber: true,
      region: true,
    },
  });

  const legacyAssignedTaskItems =
    record.assignedTaskItems.length === 0 && record.assignedTasks
      ? [
          {
            assignedToUserId: undefined,
            assignedToName: "Unassigned",
            assignedToServiceNo: undefined,
            assignedToRegion: undefined,
            taskDetails: record.assignedTasks,
            isCompleted: false,
          },
        ]
      : [];

  const safeRecord = {
    id: record.id,
    date: record.date.toISOString().slice(0, 10),
    startTime: record.startTime || "",
    finishedTime: record.finishedTime || "",
    region: record.region,
    meetingTitle: record.meetingTitle || "",
    meetingNotes: record.meetingNotes,
    participants: record.participants.map((participant) => ({
      userId: participant.userId || undefined,
      displayName: participant.displayName,
      serviceNo: participant.serviceNo || undefined,
      region: participant.region || undefined,
    })),
    assignedTaskItems:
      record.assignedTaskItems.length > 0
        ? record.assignedTaskItems.map((task) => ({
            assignedToUserId: task.assignedToUserId || undefined,
            assignedToName: task.assignedToName,
            assignedToServiceNo: task.assignedToServiceNo || undefined,
            assignedToRegion: task.assignedToRegion || undefined,
            taskDetails: task.taskDetails,
            isCompleted: task.isCompleted,
          }))
        : legacyAssignedTaskItems,
  };

  return (
    <AppShell
      title="Edit Yaumiyya"
      subtitle={record.meetingTitle || "Meeting note"}
      user={session}
    >
      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              Edit Yaumiyya
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Update meeting notes, participants and assigned user tasks.
            </p>
          </div>

          <Link
            href="/yaumiyya"
            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white"
          >
            Back
          </Link>
        </div>

        <EditYaumiyyaForm
          record={safeRecord}
          userRole={session.role}
          userRegion={session.region}
          users={users}
        />
      </section>
    </AppShell>
  );
}