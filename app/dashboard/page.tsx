import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import AppShell from "@/app/components/AppShell";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RegionCode = "SPR" | "SCPR" | "NCPR" | "NPR" | "UNPR";

export default async function DashboardPage() {
  const user = await getSession();

  if (!user) {
    redirect("/");
  }

  const taskWhere =
    user.role === "MAIN_ADMIN"
      ? {}
      : {
          region: user.region as RegionCode,
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
    recentYaumiyya,
    recentPersons,
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
      take: 3,
      include: {
        sharedToOptions: {
          include: {
            sharedToOption: {
              select: { name: true },
            },
          },
        },
        requestTypeOptions: {
          include: {
            requestTypeOption: {
              select: { name: true },
            },
          },
        },
      },
    }),

    prisma.infoShare.findMany({
      where: infoWhere,
      orderBy: { createdAt: "desc" },
      take: 3,
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
      take: 3,
      include: {
        attachments: {
          select: { id: true },
        },
        replies: {
          select: { id: true },
        },
      },
    }),

    prisma.yaumiyyaRecord.findMany({
      where: taskWhere,
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        participants: {
          select: { id: true },
        },
        assignedTaskItems: {
          select: {
            id: true,
            isCompleted: true,
          },
        },
      },
    }),

    prisma.personRecord.findMany({
      where: taskWhere,
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        crimeCategories: {
          include: {
            crimeCategory: {
              select: { name: true },
            },
          },
        },
      },
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
                <HeroButton href="/tasks/new" label="Add Task" icon="＋" />
                <HeroButton href="/information/new" label="Add Info" icon="ℹ" />
                <HeroButton
                  href="/yaumiyya/new"
                  label="Add Yaumiyya"
                  icon="☑"
                />
                <HeroButton href="/database/new" label="Add Person" icon="👤" />
                <HeroButton href="/support/new" label="New Ticket" icon="⚙" />
                <HeroButton href="/reports" label="Reports" icon="📊" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          <StatCard title="Total Tasks" value={totalTasks} href="/tasks" />
          <StatCard
            title="Pending"
            value={pendingTasks}
            href="/tasks?status=PENDING"
            tone="amber"
          />
          <StatCard
            title="In Progress"
            value={inProgressTasks}
            href="/tasks?status=IN_PROGRESS"
            tone="blue"
          />
          <StatCard
            title="Completed"
            value={completedTasks}
            href="/tasks?status=COMPLETED"
            tone="emerald"
          />
          <StatCard
            title="Closed"
            value={closedTasks}
            href="/tasks?status=CLOSED"
            tone="slate"
          />
          <StatCard
            title="Open Tickets"
            value={openSupportTickets}
            href="/support?status=OPEN"
            tone="red"
          />
        </div>

        <CollapsiblePanel
          title="System Modules"
          subtitle="Information, Yaumiyya, database, support and user overview"
          defaultOpen={false}
        >
          <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:grid-cols-3 xl:grid-cols-6">
            <ModuleCard
              title="Information"
              value={totalInformation}
              href="/information"
              icon="ℹ"
            />
            <ModuleCard
              title="Yaumiyya"
              value={totalYaumiyya}
              href="/yaumiyya"
              icon="☑"
            />
            <ModuleCard
              title="Database"
              value={totalPersons}
              href="/database"
              icon="👤"
            />
            <ModuleCard
              title="Support"
              value={totalSupportTickets}
              href="/support"
              icon="⚙"
            />
            <ModuleCard
              title="Users"
              value={user.role === "MAIN_ADMIN" ? totalUsers : "-"}
              href={user.role === "MAIN_ADMIN" ? "/users" : "/dashboard"}
              icon="🔐"
            />
            <ModuleCard
              title="Region"
              value={user.role === "MAIN_ADMIN" ? "ALL" : user.region || "-"}
              href="/dashboard"
              icon="📍"
            />
          </div>
        </CollapsiblePanel>

        <CollapsiblePanel
          title="Recent Activity"
          subtitle="Latest 3 records only. Open to check recent system updates."
          defaultOpen={false}
        >
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <RecentPanel title="Recent Task Updates" href="/tasks">
              {recentTasks.length === 0 ? (
                <EmptyBox text="No tasks added yet." />
              ) : (
                recentTasks.map((task) => {
                  const sharedTo = task.sharedToOptions
                    .map((item) => item.sharedToOption.name)
                    .join(", ");

                  const requestTypes = task.requestTypeOptions
                    .map((item) => item.requestTypeOption.name)
                    .join(", ");

                  return (
                    <RecentCard
                      key={task.id}
                      href={`/tasks/${task.id}/edit`}
                      title={task.taskNumber}
                      meta={`${formatDate(task.date)} • ${task.region} • ${
                        task.atoll
                      }${task.island ? ` / ${task.island}` : ""}`}
                      badge={<StatusBadge status={task.status} />}
                      preview={task.description}
                      footer={
                        sharedTo || requestTypes
                          ? `${sharedTo || "No shared to"}${
                              requestTypes ? ` • ${requestTypes}` : ""
                            }`
                          : "No extra details"
                      }
                    />
                  );
                })
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
                    <RecentCard
                      key={info.id}
                      href="/information"
                      title={info.title}
                      meta={`${formatDate(info.date)} • ${areas || "-"}`}
                      badge={<PriorityBadge priority={info.priority} />}
                      preview={info.details}
                      footer={
                        info.source ? `Source: ${info.source}` : "No source"
                      }
                    />
                  );
                })
              )}
            </RecentPanel>

            <RecentPanel title="Recent Support Tickets" href="/support">
              {recentSupportTickets.length === 0 ? (
                <EmptyBox text="No support tickets yet." />
              ) : (
                recentSupportTickets.map((ticket) => (
                  <RecentCard
                    key={ticket.id}
                    href={`/support/${ticket.id}`}
                    title={`${ticket.ticketNumber} — ${ticket.subject}`}
                    meta={`${ticket.createdByName} • ${formatDate(
                      ticket.createdAt
                    )}`}
                    badge={<TicketStatusBadge status={ticket.status} />}
                    preview={ticket.details}
                    footer={`${ticket.priority} priority • ${
                      ticket.attachments.length
                    } attachment(s) • ${ticket.replies.length} reply`}
                  />
                ))
              )}
            </RecentPanel>

            <RecentPanel title="Recent Yaumiyya" href="/yaumiyya">
              {recentYaumiyya.length === 0 ? (
                <EmptyBox text="No Yaumiyya records yet." />
              ) : (
                recentYaumiyya.map((record) => {
                  const completed = record.assignedTaskItems.filter(
                    (task) => task.isCompleted
                  ).length;

                  return (
                    <RecentCard
                      key={record.id}
                      href={`/yaumiyya/${record.id}/edit`}
                      title={record.meetingTitle || "Yaumiyya Meeting Note"}
                      meta={`${formatDate(record.date)} • ${record.region}${
                        record.startTime ? ` • ${record.startTime}` : ""
                      }`}
                      badge={
                        <SmallBadge>
                          {record.participants.length} Participants
                        </SmallBadge>
                      }
                      preview={record.meetingNotes}
                      footer={`${record.assignedTaskItems.length} assigned • ${completed} completed`}
                    />
                  );
                })
              )}
            </RecentPanel>

            <RecentPanel title="Recently Added Persons" href="/database">
              {recentPersons.length === 0 ? (
                <EmptyBox text="No persons added yet." />
              ) : (
                recentPersons.map((person) => {
                  const categories = person.crimeCategories
                    .map((item) => item.crimeCategory.name)
                    .join(", ");

                  return (
                    <RecentCard
                      key={person.id}
                      href={`/database/${person.id}/edit`}
                      title={person.fullName}
                      meta={`${person.region}${
                        person.island ? ` • ${person.island}` : ""
                      }${person.idNumber ? ` • ${person.idNumber}` : ""}`}
                      badge={<SmallBadge>{person.region}</SmallBadge>}
                      preview={person.address || person.notes || "No preview"}
                      footer={categories || "No category"}
                    />
                  );
                })
              )}
            </RecentPanel>
          </div>
        </CollapsiblePanel>

        <CollapsiblePanel
          title="Quick Management"
          subtitle="Open admin and management shortcuts when needed."
          defaultOpen={false}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <QuickLink href="/reports" label="Reports" />
            <QuickLink href="/support" label="Support Tickets" />
            <QuickLink href="/information" label="Shared Information" />
            <QuickLink href="/database" label="Person Database" />
            {user.role === "MAIN_ADMIN" && (
              <>
                <QuickLink href="/users" label="Manage Users" />
                <QuickLink href="/settings" label="Settings" />
              </>
            )}
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-500">
            Main Admin can view all regional data. Staff can view region-based
            records and their own support tickets.
          </p>
        </CollapsiblePanel>
      </section>
    </AppShell>
  );
}

function CollapsiblePanel({
  title,
  subtitle,
  children,
  defaultOpen = false,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="group mt-5 rounded-[2rem] border border-blue-100 bg-white p-3 shadow-sm"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-[1.5rem] bg-blue-50 px-4 py-4">
        <div className="min-w-0">
          <p className="text-sm font-black text-slate-900">{title}</p>
          <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
            {subtitle}
          </p>
        </div>

        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-sm font-black text-white transition group-open:rotate-180">
          ↓
        </span>
      </summary>

      <div className="mt-3">{children}</div>
    </details>
  );
}

function HeroButton({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="flex min-w-0 items-center justify-center gap-2 rounded-2xl bg-white/10 px-3 py-3 text-center text-xs font-black text-white ring-1 ring-white/15 transition hover:bg-white/20"
    >
      <span className="shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </Link>
  );
}

function StatCard({
  title,
  value,
  href,
  tone = "blue",
}: {
  title: string;
  value: number | string;
  href: string;
  tone?: "blue" | "amber" | "emerald" | "red" | "slate";
}) {
  const toneClass =
    tone === "amber"
      ? "bg-amber-50 text-amber-700"
      : tone === "emerald"
        ? "bg-emerald-50 text-emerald-700"
        : tone === "red"
          ? "bg-red-50 text-red-700"
          : tone === "slate"
            ? "bg-slate-100 text-slate-700"
            : "bg-blue-50 text-blue-700";

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

      <span
        className={`mt-3 inline-flex rounded-full px-3 py-1 text-[10px] font-black ${toneClass}`}
      >
        View
      </span>
    </Link>
  );
}

function ModuleCard({
  title,
  value,
  href,
  icon,
}: {
  title: string;
  value: number | string;
  href: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="min-w-0 rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-sm hover:bg-blue-50"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="truncate text-[11px] font-black uppercase tracking-wide text-slate-400">
          {title}
        </p>

        <span className="shrink-0 rounded-xl bg-blue-50 px-2 py-1 text-xs">
          {icon}
        </span>
      </div>

      <p className="mt-2 truncate text-xl font-black text-slate-900">{value}</p>
    </Link>
  );
}

function RecentPanel({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-[1.7rem] border border-blue-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="min-w-0 truncate text-base font-black text-slate-900">
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

function RecentCard({
  href,
  title,
  meta,
  badge,
  preview,
  footer,
}: {
  href: string;
  title: string;
  meta: string;
  badge: ReactNode;
  preview: string;
  footer: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-[1.5rem] bg-slate-50 p-4 transition hover:bg-blue-50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="line-clamp-2 break-words font-black text-slate-900 [overflow-wrap:anywhere]">
            {title}
          </p>
          <p className="mt-1 line-clamp-1 text-xs font-bold text-slate-500">
            {meta}
          </p>
        </div>

        {badge}
      </div>

      <p className="dhivehi-text line-clamp-2 mt-3 break-words text-sm leading-6 text-slate-700 [overflow-wrap:anywhere]">
        {preview}
      </p>

      <p className="mt-3 line-clamp-1 text-xs font-black text-slate-400">
        {footer}
      </p>
    </Link>
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

function SmallBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
      {children}
    </span>
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