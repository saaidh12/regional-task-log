import Link from "next/link";
import { redirect } from "next/navigation";

import AppShell from "@/app/components/AppShell";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const user = await getSession();

  if (!user) {
    redirect("/");
  }

  const where =
    user.role === "MAIN_ADMIN"
      ? {}
      : {
          region: user.region as "SPR" | "SCPR" | "NCPR" | "NPR" | "UNPR",
        };

  const [
    totalTasks,
    pendingTasks,
    inProgressTasks,
    completedTasks,
    closedTasks,
    totalUsers,
  ] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.count({ where: { ...where, status: "PENDING" } }),
    prisma.task.count({ where: { ...where, status: "IN_PROGRESS" } }),
    prisma.task.count({ where: { ...where, status: "COMPLETED" } }),
    prisma.task.count({ where: { ...where, status: "CLOSED" } }),
    prisma.user.count(),
  ]);

  const recentTasks = await prisma.task.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  return (
    <AppShell
      title="Dashboard"
      subtitle="Overview of regional task records"
      user={user}
    >
      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <div className="rounded-[2rem] bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/10">
          <p className="text-xs font-black uppercase tracking-wide text-blue-200">
            Dashboard
          </p>

          <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            Regional Task Overview
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Manage regional task records, staff access, and reports from one
            internal system.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/tasks/new"
              className="rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-black text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
            >
              Add Task
            </Link>

            <Link
              href="/tasks"
              className="rounded-2xl bg-white/10 px-5 py-3 text-center text-sm font-black text-white hover:bg-white/15"
            >
              View Records
            </Link>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-6">
          <StatCard title="Total Tasks" value={totalTasks} />
          <StatCard title="Pending" value={pendingTasks} />
          <StatCard title="In Progress" value={inProgressTasks} />
          <StatCard title="Completed" value={completedTasks} />
          <StatCard title="Closed" value={closedTasks} />
          <StatCard
            title="Users"
            value={user.role === "MAIN_ADMIN" ? totalUsers : "-"}
          />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Recent Task Updates
                </h3>
                <p className="text-sm text-slate-500">
                  Latest 5 task records
                </p>
              </div>

              <Link
                href="/tasks"
                className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-black text-white"
              >
                View All
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {recentTasks.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-5 text-center text-sm font-bold text-slate-500">
                  No tasks added yet.
                </div>
              ) : (
                recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h4 className="font-black text-slate-900">
                          {task.taskNumber}
                        </h4>
                        <p className="text-xs font-bold text-slate-500">
                          {formatDate(task.date)} • {task.region} •{" "}
                          {task.atoll}
                        </p>
                      </div>

                      <StatusBadge status={task.status} />
                    </div>

                    <p className="dhivehi-text line-clamp-2 mt-3 text-base text-slate-700">
                      {task.description}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-black text-slate-900">
              Access Permission
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Main Admin can view all regional data. Staff can view only their
              own region and edit only records they created. Disabled users
              cannot login, but old records remain saved.
            </p>

            <div className="mt-5 space-y-3">
              <QuickLink href="/tasks/new" label="Add Task" />
              <QuickLink href="/tasks" label="Task Records" />
              <QuickLink href="/reports" label="Reports" />
              {user.role === "MAIN_ADMIN" && (
                <QuickLink href="/users" label="Manage Users" />
              )}
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: number | string;
}) {
  return (
    <div className="rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-700 hover:bg-blue-50 hover:text-blue-700"
    >
      <span>{label}</span>
      <span>→</span>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const classes =
    status === "COMPLETED"
      ? "bg-emerald-50 text-emerald-700"
      : status === "IN_PROGRESS"
        ? "bg-blue-50 text-blue-700"
        : status === "CLOSED"
          ? "bg-slate-100 text-slate-700"
          : "bg-amber-50 text-amber-700";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${classes}`}
    >
      {formatStatus(status)}
    </span>
  );
}

function formatStatus(status: string) {
  if (status === "PENDING") return "Pending";
  if (status === "IN_PROGRESS") return "In Progress";
  if (status === "COMPLETED") return "Completed";
  if (status === "CLOSED") return "Closed";
  return status;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}