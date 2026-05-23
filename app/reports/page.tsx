import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import AppShell from "@/app/components/AppShell";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const REGIONS = ["SPR", "SCPR", "NCPR", "NPR", "UNPR"] as const;

type RegionCode = (typeof REGIONS)[number];

export default async function ReportsPage() {
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

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59
  );
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const regionWhere =
    session.role === "MAIN_ADMIN"
      ? {}
      : { region: session.region as RegionCode };

  const infoWhere =
    session.role === "MAIN_ADMIN"
      ? {}
      : {
          sharedToAreas: {
            some: {
              area: {
                name: session.region || "",
              },
            },
          },
        };

  const supportWhere =
    session.role === "MAIN_ADMIN"
      ? {}
      : {
          createdByUserId: session.id,
        };

  const [
    totalTasks,
    todayTasks,
    monthTasks,
    pendingTasks,
    inProgressTasks,
    completedTasks,
    closedTasks,

    totalInfo,
    monthInfo,
    importantInfo,
    urgentInfo,

    totalYaumiyya,
    monthYaumiyya,
    totalParticipants,
    totalAssignedYaumiyyaTasks,

    totalPersons,
    monthPersons,

    totalSupport,
    openSupport,
    inProgressSupport,
    fixedSupport,
    urgentSupport,
  ] = await Promise.all([
    prisma.task.count({ where: regionWhere }),
    prisma.task.count({
      where: { ...regionWhere, date: { gte: todayStart, lte: todayEnd } },
    }),
    prisma.task.count({
      where: { ...regionWhere, date: { gte: monthStart } },
    }),
    prisma.task.count({ where: { ...regionWhere, status: "PENDING" } }),
    prisma.task.count({ where: { ...regionWhere, status: "IN_PROGRESS" } }),
    prisma.task.count({ where: { ...regionWhere, status: "COMPLETED" } }),
    prisma.task.count({ where: { ...regionWhere, status: "CLOSED" } }),

    prisma.infoShare.count({ where: infoWhere }),
    prisma.infoShare.count({
      where: { ...infoWhere, date: { gte: monthStart } },
    }),
    prisma.infoShare.count({
      where: { ...infoWhere, priority: "IMPORTANT" },
    }),
    prisma.infoShare.count({
      where: { ...infoWhere, priority: "URGENT" },
    }),

    prisma.yaumiyyaRecord.count({ where: regionWhere }),
    prisma.yaumiyyaRecord.count({
      where: { ...regionWhere, date: { gte: monthStart } },
    }),
    prisma.yaumiyyaParticipant.count({
      where: { yaumiyya: regionWhere },
    }),
    prisma.yaumiyyaAssignedTask.count({
      where: { yaumiyya: regionWhere },
    }),

    prisma.personRecord.count({ where: regionWhere }),
    prisma.personRecord.count({
      where: { ...regionWhere, createdAt: { gte: monthStart } },
    }),

    prisma.supportTicket.count({ where: supportWhere }),
    prisma.supportTicket.count({ where: { ...supportWhere, status: "OPEN" } }),
    prisma.supportTicket.count({
      where: { ...supportWhere, status: "IN_PROGRESS" },
    }),
    prisma.supportTicket.count({ where: { ...supportWhere, status: "FIXED" } }),
    prisma.supportTicket.count({
      where: { ...supportWhere, priority: "URGENT" },
    }),
  ]);

  const regionRows =
    session.role === "MAIN_ADMIN"
      ? await Promise.all(
          REGIONS.map(async (region) => {
            const [total, pending, progress, completed, closed] =
              await Promise.all([
                prisma.task.count({ where: { region } }),
                prisma.task.count({ where: { region, status: "PENDING" } }),
                prisma.task.count({
                  where: { region, status: "IN_PROGRESS" },
                }),
                prisma.task.count({ where: { region, status: "COMPLETED" } }),
                prisma.task.count({ where: { region, status: "CLOSED" } }),
              ]);

            return { region, total, pending, progress, completed, closed };
          })
        )
      : [
          {
            region: session.region || "-",
            total: totalTasks,
            pending: pendingTasks,
            progress: inProgressTasks,
            completed: completedTasks,
            closed: closedTasks,
          },
        ];

  const staffRowsRaw = await prisma.task.groupBy({
    by: ["createdByUserId", "createdByName", "createdByServiceNumber", "region"],
    where: regionWhere,
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 10,
  });

  const staffRows = await Promise.all(
    staffRowsRaw.map(async (staff) => {
      const where = {
        ...regionWhere,
        createdByUserId: staff.createdByUserId,
      };

      const [pending, progress, completed, closed] = await Promise.all([
        prisma.task.count({ where: { ...where, status: "PENDING" } }),
        prisma.task.count({ where: { ...where, status: "IN_PROGRESS" } }),
        prisma.task.count({ where: { ...where, status: "COMPLETED" } }),
        prisma.task.count({ where: { ...where, status: "CLOSED" } }),
      ]);

      return {
        name: staff.createdByName,
        serviceNumber: staff.createdByServiceNumber,
        region: staff.region,
        total: staff._count.id,
        pending,
        progress,
        completed,
        closed,
      };
    })
  );

  const requestTypeRowsRaw = await prisma.taskRequestTypeOption.groupBy({
    by: ["requestTypeOptionId"],
    where: { task: regionWhere },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 8,
  });

  const requestTypeRows = await Promise.all(
    requestTypeRowsRaw.map(async (row) => {
      const option = await prisma.requestTypeOption.findUnique({
        where: { id: row.requestTypeOptionId },
        select: { name: true },
      });

      return {
        name: option?.name || "-",
        count: row._count.id,
      };
    })
  );

  const sharedToRowsRaw = await prisma.taskSharedToOption.groupBy({
    by: ["sharedToOptionId"],
    where: { task: regionWhere },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 8,
  });

  const sharedToRows = await Promise.all(
    sharedToRowsRaw.map(async (row) => {
      const option = await prisma.sharedToOption.findUnique({
        where: { id: row.sharedToOptionId },
        select: { name: true },
      });

      return {
        name: option?.name || "-",
        count: row._count.id,
      };
    })
  );

  const infoAreaRowsRaw = await prisma.infoShareToArea.groupBy({
    by: ["areaId"],
    where:
      session.role === "MAIN_ADMIN"
        ? {}
        : {
            area: {
              name: session.region || "",
            },
          },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 8,
  });

  const infoAreaRows = await Promise.all(
    infoAreaRowsRaw.map(async (row) => {
      const area = await prisma.infoShareArea.findUnique({
        where: { id: row.areaId },
        select: { name: true },
      });

      return {
        name: area?.name || "-",
        count: row._count.id,
      };
    })
  );

  const crimeCategoryRowsRaw = await prisma.personCrimeCategory.groupBy({
    by: ["crimeCategoryId"],
    where: { person: regionWhere },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 8,
  });

  const crimeCategoryRows = await Promise.all(
    crimeCategoryRowsRaw.map(async (row) => {
      const category = await prisma.crimeCategory.findUnique({
        where: { id: row.crimeCategoryId },
        select: { name: true },
      });

      return {
        name: category?.name || "-",
        count: row._count.id,
      };
    })
  );

  return (
    <AppShell
      title="Reports"
      subtitle={
        session.role === "MAIN_ADMIN"
          ? "All region summary"
          : `${session.region} summary`
      }
      user={session}
    >
      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600 text-white shadow-xl shadow-blue-900/20">
          <div className="relative p-6 sm:p-8">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-400/20 blur-2xl" />
            <div className="absolute bottom-0 left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

            <div className="relative">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-100">
                Reports
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                System Performance Summary
              </h2>

              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-blue-100 sm:text-base">
                Clean summary of tasks, information shared, Yaumiyya, database
                and support tickets.
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/tasks"
                  className="rounded-2xl bg-white px-5 py-3 text-center text-sm font-black text-blue-700"
                >
                  Task Records
                </Link>

                {session.role === "MAIN_ADMIN" && (
                  <Link
                    href="/reports/exports"
                    className="rounded-2xl bg-white px-5 py-3 text-center text-sm font-black text-blue-700"
                  >
                    Monthly Exports
                  </Link>
                )}

                <Link
                  href="/dashboard"
                  className="rounded-2xl bg-white/10 px-5 py-3 text-center text-sm font-black text-white ring-1 ring-white/20"
                >
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          <SummaryCard title="Total Tasks" value={totalTasks} href="/tasks" />
          <SummaryCard
            title="Pending"
            value={pendingTasks}
            href="/tasks?status=PENDING"
            tone="amber"
          />
          <SummaryCard
            title="Completed"
            value={completedTasks}
            href="/tasks?status=COMPLETED"
            tone="emerald"
          />
          <SummaryCard
            title="Info Shared"
            value={totalInfo}
            href="/information"
          />
          <SummaryCard title="Yaumiyya" value={totalYaumiyya} href="/yaumiyya" />
          <SummaryCard
            title="Open Tickets"
            value={openSupport}
            href="/support?status=OPEN"
            tone="red"
          />
        </div>

        <CollapsiblePanel
          title="Task Report"
          subtitle="Task status, region progress and officer task count."
          defaultOpen
        >
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-7">
            <ReportCard title="Total" value={totalTasks} />
            <ReportCard title="Today" value={todayTasks} />
            <ReportCard title="This Month" value={monthTasks} />
            <ReportCard title="Pending" value={pendingTasks} />
            <ReportCard title="In Progress" value={inProgressTasks} />
            <ReportCard title="Completed" value={completedTasks} />
            <ReportCard title="Closed" value={closedTasks} />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
            <SimpleTable
              title="Region Wise Task Summary"
              headers={[
                "Region",
                "Total",
                "Pending",
                "Progress",
                "Completed",
                "Closed",
              ]}
              rows={regionRows.map((row) => [
                row.region,
                row.total,
                row.pending,
                row.progress,
                row.completed,
                row.closed,
              ])}
            />

            <div className="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-black text-slate-900">
                Request Type
              </h3>

              <div className="mt-4 space-y-3">
                {requestTypeRows.length === 0 ? (
                  <EmptyBox text="No request type data." />
                ) : (
                  requestTypeRows.map((row) => (
                    <CountRow
                      key={row.name}
                      label={row.name}
                      value={row.count}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </CollapsiblePanel>

        <CollapsiblePanel
          title="Officer Task Count"
          subtitle="Top officers by task records. Hidden to keep report page short."
        >
          <div className="space-y-3">
            {staffRows.length === 0 ? (
              <EmptyBox text="No officer task data." />
            ) : (
              staffRows.map((staff) => (
                <StaffCard
                  key={`${staff.serviceNumber}-${staff.region}`}
                  staff={staff}
                />
              ))
            )}
          </div>
        </CollapsiblePanel>

        <CollapsiblePanel
          title="Information Shared Report"
          subtitle="Information counts, priority and shared areas."
        >
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
            <ReportCard title="Total" value={totalInfo} />
            <ReportCard title="This Month" value={monthInfo} />
            <ReportCard title="Important" value={importantInfo} />
            <ReportCard title="Urgent" value={urgentInfo} />
            <ReportCard
              title="Normal"
              value={Math.max(totalInfo - importantInfo - urgentInfo, 0)}
            />
          </div>

          <div className="mt-5 rounded-[2rem] border border-blue-100 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-black text-slate-900">
              Shared Area Count
            </h3>

            <div className="mt-4 space-y-3">
              {infoAreaRows.length === 0 ? (
                <EmptyBox text="No shared area data." />
              ) : (
                infoAreaRows.map((row) => (
                  <CountRow key={row.name} label={row.name} value={row.count} />
                ))
              )}
            </div>
          </div>
        </CollapsiblePanel>

        <CollapsiblePanel
          title="Yaumiyya Report"
          subtitle="Meeting note count, participants and assigned tasks."
        >
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <ReportCard title="Total Yaumiyya" value={totalYaumiyya} />
            <ReportCard title="This Month" value={monthYaumiyya} />
            <ReportCard title="Participants" value={totalParticipants} />
            <ReportCard
              title="Assigned Tasks"
              value={totalAssignedYaumiyyaTasks}
            />
          </div>
        </CollapsiblePanel>

        <CollapsiblePanel
          title="Person Database Report"
          subtitle="Database record count and crime category summary."
        >
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-2">
            <ReportCard title="Total Persons" value={totalPersons} />
            <ReportCard title="Added This Month" value={monthPersons} />
          </div>

          <div className="mt-5 rounded-[2rem] border border-blue-100 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-black text-slate-900">
              Crime Category Count
            </h3>

            <div className="mt-4 space-y-3">
              {crimeCategoryRows.length === 0 ? (
                <EmptyBox text="No crime category data." />
              ) : (
                crimeCategoryRows.map((row) => (
                  <CountRow key={row.name} label={row.name} value={row.count} />
                ))
              )}
            </div>
          </div>
        </CollapsiblePanel>

        <CollapsiblePanel
          title="Support Ticket Report"
          subtitle="Support status and urgent ticket count."
        >
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
            <ReportCard title="Total Tickets" value={totalSupport} />
            <ReportCard title="Open" value={openSupport} />
            <ReportCard title="In Progress" value={inProgressSupport} />
            <ReportCard title="Fixed" value={fixedSupport} />
            <ReportCard title="Urgent" value={urgentSupport} />
          </div>
        </CollapsiblePanel>

        <CollapsiblePanel
          title="Task Shared To"
          subtitle="Shows where tasks are mostly shared."
        >
          <div className="space-y-3">
            {sharedToRows.length === 0 ? (
              <EmptyBox text="No shared-to task data." />
            ) : (
              sharedToRows.map((row) => (
                <CountRow key={row.name} label={row.name} value={row.count} />
              ))
            )}
          </div>
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

      <div className="mt-4">{children}</div>
    </details>
  );
}

function SummaryCard({
  title,
  value,
  href,
  tone = "blue",
}: {
  title: string;
  value: number;
  href: string;
  tone?: "blue" | "amber" | "emerald" | "red";
}) {
  const toneClass =
    tone === "amber"
      ? "bg-amber-50 text-amber-700"
      : tone === "emerald"
        ? "bg-emerald-50 text-emerald-700"
        : tone === "red"
          ? "bg-red-50 text-red-700"
          : "bg-blue-50 text-blue-700";

  return (
    <Link
      href={href}
      className="rounded-[1.5rem] border border-blue-100 bg-white p-4 shadow-sm hover:bg-blue-50"
    >
      <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
        {title}
      </p>
      <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
      <span
        className={`mt-3 inline-flex rounded-full px-3 py-1 text-[10px] font-black ${toneClass}`}
      >
        View
      </span>
    </Link>
  );
}

function ReportCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-[1.5rem] border border-blue-100 bg-white p-4 shadow-sm">
      <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
        {title}
      </p>
      <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function SimpleTable({
  title,
  headers,
  rows,
}: {
  title: string;
  headers: string[];
  rows: (string | number)[][];
}) {
  return (
    <div className="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-black text-slate-900">{title}</h3>

      <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-blue-100">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-sm">
            <thead className="bg-blue-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                {headers.map((header) => (
                  <th key={header} className="p-4 text-left">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className="border-t border-blue-50">
                  {row.map((cell, i) => (
                    <td key={i} className="p-4 font-bold text-slate-700">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StaffCard({
  staff,
}: {
  staff: {
    name: string;
    serviceNumber: string;
    region: string;
    total: number;
    pending: number;
    progress: number;
    completed: number;
    closed: number;
  };
}) {
  return (
    <div className="rounded-[1.5rem] bg-slate-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h4 className="font-black text-slate-900">{staff.name}</h4>
          <p className="mt-1 text-xs font-bold text-slate-500">
            {staff.serviceNumber} • {staff.region}
          </p>
        </div>

        <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-black text-blue-700">
          {staff.total} tasks
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <MiniCount label="Pending" value={staff.pending} />
        <MiniCount label="Progress" value={staff.progress} />
        <MiniCount label="Completed" value={staff.completed} />
        <MiniCount label="Closed" value={staff.closed} />
      </div>
    </div>
  );
}

function CountRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
      <p className="break-words font-black text-slate-800">{label}</p>
      <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-black text-blue-700">
        {value}
      </span>
    </div>
  );
}

function MiniCount({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl bg-white p-3">
      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-slate-900">{value}</p>
    </div>
  );
}

function EmptyBox({ text }: { text: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 text-center text-sm font-bold text-slate-500">
      {text}
    </div>
  );
}