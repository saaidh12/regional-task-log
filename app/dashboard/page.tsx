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

  const taskWhere =
    user.role === "MAIN_ADMIN"
      ? {}
      : {
          region: user.region as "SPR" | "SCPR" | "NCPR" | "NPR" | "UNPR",
        };

  const infoWhere =
    user.role === "MAIN_ADMIN"
      ? {}
      : {
          sharedToAreas: {
            some: {
              area: {
                name: user.region || "",
              },
            },
          },
        };

  const supportWhere =
    user.role === "MAIN_ADMIN"
      ? {}
      : {
          createdByUserId: user.id,
        };

  const [
    totalTasks,
    pendingTasks,
    inProgressTasks,
    completedTasks,
    closedTasks,
    totalUsers,
    totalPersons,
    totalYaumiyya,
    totalInformation,
    totalSupportTickets,
    openSupportTickets,
    recentTasks,
    recentInformation,
    recentSupportTickets,
  ] = await Promise.all([
    prisma.task.count({ where: taskWhere }),
    prisma.task.count({ where: { ...taskWhere, status: "PENDING" } }),
    prisma.task.count({ where: { ...taskWhere, status: "IN_PROGRESS" } }),
    prisma.task.count({ where: { ...taskWhere, status: "COMPLETED" } }),
    prisma.task.count({ where: { ...taskWhere, status: "CLOSED" } }),
    prisma.user.count(),
    prisma.personRecord.count({ where: taskWhere }),
    prisma.yaumiyyaRecord.count({ where: taskWhere }),
    prisma.infoShare.count({ where: infoWhere }),
    prisma.supportTicket.count({ where: supportWhere }),
    prisma.supportTicket.count({ where: { ...supportWhere, status: "OPEN" } }),

    prisma.task.findMany({
      where: taskWhere,
      orderBy: { createdAt: "desc" },
      take: 4,
    }),

    prisma.infoShare.findMany({
      where: infoWhere,
      orderBy: { createdAt: "desc" },
      take: 4,
      include: {
        sharedToAreas: {
          include: {
            area: {
              select: { name: true },
            },
          },
        },
      },
    }),

    prisma.supportTicket.findMany({
      where: supportWhere,
      orderBy: { updatedAt: "desc" },
      take: 4,
    }),
  ]);

  return (
    <AppShell
      title="Dashboard"
      subtitle="Overview of internal regional system"
      user={user}
    >
      <section className="mx-auto w-full max-w-7xl overflow-hidden px-3 py-4 sm:px-6">
        <div className="overflow-hidden rounded-[1.7rem] bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600 text-white shadow-xl shadow-blue-900/20 sm:rounded-[2rem]">
          <div className="relative p-5 sm:p-8">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-400/20 blur-2xl" />
            <div className="absolute bottom-0 left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

            <div className="relative">
              <p className="text-[11px] font-black uppercase tracking-[0.25em] text-blue-100">
                Dashboard
              </p>

              <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-4xl">
                Regional System Overview
              </h2>

              <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-blue-100 sm:text-base">
                Manage tasks, shared information, Yaumiyya notes, person
                database and support tickets from one internal system.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-2 min-[360px]:grid-cols-2 sm:grid-cols-3 xl:grid-cols-6">
                <HeroButton href="/tasks/new" label="Add Task" />
                <HeroButton href="/information/new" label="Add Info" />
                <HeroButton href="/yaumiyya/new" label="Add Yaumiyya" />
                <HeroButton href="/database/new" label="Add Person" />
                <HeroButton href="/support/new" label="New Ticket" />
                <HeroButton href="/reports" label="Reports" />
              </div>
            </div>
          </div>
        </div>

        <details className="group mt-5 rounded-[2rem] border border-blue-100 bg-white p-3 shadow-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-[1.5rem] bg-blue-50 px-4 py-4">
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-900">
                Overview Numbers
              </p>
              <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
                Tasks, information, database, support and region summary
              </p>
            </div>

            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-sm font-black text-white transition group-open:rotate-180">
              ↓
            </span>
          </summary>

          <div className="mt-3 grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:grid-cols-3 xl:grid-cols-6">
            <StatCard title="Tasks" value={totalTasks} href="/tasks" />
            <StatCard title="Pending" value={pendingTasks} href="/tasks" />
            <StatCard
              title="Information"
              value={totalInformation}
              href="/information"
            />
            <StatCard title="Yaumiyya" value={totalYaumiyya} href="/yaumiyya" />
            <StatCard title="Database" value={totalPersons} href="/database" />
            <StatCard
              title="Support"
              value={totalSupportTickets}
              href="/support"
            />

            <MiniStat title="In Progress" value={inProgressTasks} />
            <MiniStat title="Completed" value={completedTasks} />
            <MiniStat title="Closed" value={closedTasks} />
            <MiniStat title="Open Tickets" value={openSupportTickets} />
            <MiniStat
              title="Users"
              value={user.role === "MAIN_ADMIN" ? totalUsers : "-"}
            />
            <MiniStat
              title="Region"
              value={user.role === "MAIN_ADMIN" ? "ALL" : user.region || "-"}
            />
          </div>
        </details>

        <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-3">
          <RecentPanel title="Recent Task Updates" href="/tasks">
            {recentTasks.length === 0 ? (
              <EmptyBox text="No tasks added yet." />
            ) : (
              recentTasks.map((task) => (
                <Link
                  key={task.id}
                  href="/tasks"
                  className="block rounded-2xl bg-slate-50 p-4 hover:bg-blue-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-black text-slate-900">
                        {task.taskNumber}
                      </p>
                      <p className="mt-1 text-xs font-bold text-slate-500">
                        {formatDate(task.date)} • {task.region} • {task.atoll}
                      </p>
                    </div>

                    <StatusBadge status={task.status} />
                  </div>

                  <p className="dhivehi-text line-clamp-2 mt-3 break-words text-sm text-slate-700 [overflow-wrap:anywhere]">
                    {task.description}
                  </p>
                </Link>
              ))
            )}
          </RecentPanel>

          <RecentPanel title="Recent Shared Information" href="/information">
            {recentInformation.length === 0 ? (
              <EmptyBox text="No information added yet." />
            ) : (
              recentInformation.map((info) => {
                const areas = info.sharedToAreas
                  .map((item) => item.area.name)
                  .join(", ");

                return (
                  <Link
                    key={info.id}
                    href="/information"
                    className="block rounded-2xl bg-slate-50 p-4 hover:bg-blue-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="line-clamp-2 break-words font-black text-slate-900 [overflow-wrap:anywhere]">
                          {info.title}
                        </p>
                        <p className="mt-1 text-xs font-bold text-slate-500">
                          {formatDate(info.date)} • {areas || "-"}
                        </p>
                      </div>

                      <PriorityBadge priority={info.priority} />
                    </div>
                  </Link>
                );
              })
            )}
          </RecentPanel>

          <RecentPanel title="Recent Support Tickets" href="/support">
            {recentSupportTickets.length === 0 ? (
              <EmptyBox text="No support tickets yet." />
            ) : (
              recentSupportTickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/support/${ticket.id}`}
                  className="block rounded-2xl bg-slate-50 p-4 hover:bg-blue-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-black text-blue-700">
                        {ticket.ticketNumber}
                      </p>
                      <p className="mt-1 line-clamp-2 break-words text-sm font-black text-slate-900 [overflow-wrap:anywhere]">
                        {ticket.subject}
                      </p>
                      <p className="mt-1 truncate text-xs font-bold text-slate-500">
                        {ticket.createdByName}
                      </p>
                    </div>

                    <TicketStatusBadge status={ticket.status} />
                  </div>
                </Link>
              ))
            )}
          </RecentPanel>
        </div>

        <div className="mt-5 rounded-[2rem] border border-blue-100 bg-white p-4 shadow-sm sm:p-5">
          <h3 className="text-lg font-black text-slate-900">
            Access Permission
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Main Admin can view all regional data. Staff can view region based
            data and their own support tickets. Disabled users cannot login, but
            old records remain saved.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <QuickLink href="/reports" label="Reports" />
            <QuickLink href="/support" label="Support Tickets" />
            {user.role === "MAIN_ADMIN" && (
              <>
                <QuickLink href="/users" label="Manage Users" />
                <QuickLink href="/settings" label="Settings" />
              </>
            )}
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function HeroButton({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="min-w-0 rounded-2xl bg-white/10 px-3 py-3 text-center text-xs font-black text-white ring-1 ring-white/15 transition hover:bg-white/20"
    >
      <span className="block truncate">{label}</span>
    </Link>
  );
}

function StatCard({
  title,
  value,
  href,
}: {
  title: string;
  value: number | string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="min-w-0 rounded-[1.4rem] border border-blue-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-950/10"
    >
      <p className="truncate text-[11px] font-black uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-2 truncate text-2xl font-black text-slate-900">
        {value}
      </p>
    </Link>
  );
}

function MiniStat({
  title,
  value,
}: {
  title: string;
  value: number | string;
}) {
  return (
    <div className="min-w-0 rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-sm">
      <p className="truncate text-[11px] font-black uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-2 truncate text-xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function RecentPanel({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-[2rem] border border-blue-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="min-w-0 truncate text-lg font-black text-slate-900">
          {title}
        </h3>

        <Link
          href={href}
          className="shrink-0 rounded-2xl bg-slate-900 px-4 py-2 text-xs font-black text-white"
        >
          View
        </Link>
      </div>

      <div className="space-y-3">{children}</div>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex min-w-0 items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-700 hover:bg-blue-50 hover:text-blue-700"
    >
      <span className="truncate">{label}</span>
      <span className="shrink-0">→</span>
    </Link>
  );
}

function EmptyBox({ text }: { text: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5 text-center text-sm font-bold text-slate-500">
      {text}
    </div>
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
      className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-black ${classes}`}
    >
      {formatStatus(status)}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const classes =
    priority === "URGENT"
      ? "bg-red-50 text-red-700"
      : priority === "IMPORTANT"
        ? "bg-amber-50 text-amber-700"
        : "bg-blue-50 text-blue-700";

  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-black ${classes}`}
    >
      {priority}
    </span>
  );
}

function TicketStatusBadge({ status }: { status: string }) {
  const classes =
    status === "FIXED"
      ? "bg-emerald-50 text-emerald-700"
      : status === "IN_PROGRESS"
        ? "bg-blue-50 text-blue-700"
        : status === "CLOSED"
          ? "bg-slate-100 text-slate-700"
          : status === "REJECTED"
            ? "bg-red-50 text-red-700"
            : "bg-amber-50 text-amber-700";

  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-black ${classes}`}
    >
      {formatTicketStatus(status)}
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

function formatTicketStatus(status: string) {
  return status
    .split("_")
    .map((item) => item.charAt(0) + item.slice(1).toLowerCase())
    .join(" ");
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}