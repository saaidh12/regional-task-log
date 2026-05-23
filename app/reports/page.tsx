import Link from "next/link";
import { redirect } from "next/navigation";

import AppShell from "@/app/components/AppShell";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const REGIONS = ["SPR", "SCPR", "NCPR", "NPR", "UNPR"] as const;

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

  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0
  );

  const todayEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59
  );

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);

  const baseWhere =
    session.role === "MAIN_ADMIN"
      ? {}
      : {
          region: session.region as "SPR" | "SCPR" | "NCPR" | "NPR" | "UNPR",
        };

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

  const [
    totalTasks,
    todayTasks,
    monthTasks,
    pendingTasks,
    inProgressTasks,
    completedTasks,
    closedTasks,
    recentTasks,

    totalInfo,
    todayInfo,
    monthInfo,
    normalInfo,
    importantInfo,
    urgentInfo,
    recentInfo,
  ] = await Promise.all([
    prisma.task.count({ where: baseWhere }),

    prisma.task.count({
      where: {
        ...baseWhere,
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    }),

    prisma.task.count({
      where: {
        ...baseWhere,
        date: {
          gte: monthStart,
        },
      },
    }),

    prisma.task.count({
      where: {
        ...baseWhere,
        status: "PENDING",
      },
    }),

    prisma.task.count({
      where: {
        ...baseWhere,
        status: "IN_PROGRESS",
      },
    }),

    prisma.task.count({
      where: {
        ...baseWhere,
        status: "COMPLETED",
      },
    }),

    prisma.task.count({
      where: {
        ...baseWhere,
        status: "CLOSED",
      },
    }),

    prisma.task.findMany({
      where: baseWhere,
      orderBy: {
        updatedAt: "desc",
      },
      take: 6,
    }),

    prisma.infoShare.count({ where: infoWhere }),

    prisma.infoShare.count({
      where: {
        ...infoWhere,
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    }),

    prisma.infoShare.count({
      where: {
        ...infoWhere,
        date: {
          gte: monthStart,
        },
      },
    }),

    prisma.infoShare.count({
      where: {
        ...infoWhere,
        priority: "NORMAL",
      },
    }),

    prisma.infoShare.count({
      where: {
        ...infoWhere,
        priority: "IMPORTANT",
      },
    }),

    prisma.infoShare.count({
      where: {
        ...infoWhere,
        priority: "URGENT",
      },
    }),

    prisma.infoShare.findMany({
      where: infoWhere,
      orderBy: {
        updatedAt: "desc",
      },
      take: 6,
      include: {
        sharedToAreas: {
          include: {
            area: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const regionRows =
    session.role === "MAIN_ADMIN"
      ? await Promise.all(
          REGIONS.map(async (region) => {
            const [total, pending, inProgress, completed, closed] =
              await Promise.all([
                prisma.task.count({ where: { region } }),
                prisma.task.count({ where: { region, status: "PENDING" } }),
                prisma.task.count({
                  where: { region, status: "IN_PROGRESS" },
                }),
                prisma.task.count({ where: { region, status: "COMPLETED" } }),
                prisma.task.count({ where: { region, status: "CLOSED" } }),
              ]);

            return {
              region,
              total,
              pending,
              inProgress,
              completed,
              closed,
            };
          })
        )
      : [
          {
            region: session.region || "-",
            total: totalTasks,
            pending: pendingTasks,
            inProgress: inProgressTasks,
            completed: completedTasks,
            closed: closedTasks,
          },
        ];

  const staffRaw = await prisma.task.groupBy({
    by: ["createdByUserId", "createdByName", "createdByServiceNumber", "region"],
    where: baseWhere,
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
    take: 20,
  });

  const staffRows = await Promise.all(
    staffRaw.map(async (staff) => {
      const where = {
        ...baseWhere,
        createdByUserId: staff.createdByUserId,
      };

      const [pending, inProgress, completed, closed, lastTask] =
        await Promise.all([
          prisma.task.count({ where: { ...where, status: "PENDING" } }),
          prisma.task.count({ where: { ...where, status: "IN_PROGRESS" } }),
          prisma.task.count({ where: { ...where, status: "COMPLETED" } }),
          prisma.task.count({ where: { ...where, status: "CLOSED" } }),
          prisma.task.findFirst({
            where,
            orderBy: {
              updatedAt: "desc",
            },
            select: {
              updatedAt: true,
            },
          }),
        ]);

      return {
        name: staff.createdByName,
        serviceNumber: staff.createdByServiceNumber,
        region: staff.region,
        total: staff._count.id,
        pending,
        inProgress,
        completed,
        closed,
        lastUpdate: lastTask?.updatedAt || null,
      };
    })
  );

  const requestTypeRowsRaw = await prisma.taskRequestTypeOption.groupBy({
    by: ["requestTypeOptionId"],
    _count: {
      id: true,
    },
    where: {
      task: baseWhere,
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
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
    _count: {
      id: true,
    },
    where: {
      task: baseWhere,
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
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
    _count: {
      id: true,
    },
    where:
      session.role === "MAIN_ADMIN"
        ? {}
        : {
            area: {
              name: session.region || "",
            },
          },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
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

  const infoStaffRaw = await prisma.infoShare.groupBy({
    by: ["createdByUserId", "createdByName", "createdByServiceNumber"],
    where: infoWhere,
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
    take: 20,
  });

  const infoStaffRows = await Promise.all(
    infoStaffRaw.map(async (staff) => {
      const where = {
        ...infoWhere,
        createdByUserId: staff.createdByUserId,
      };

      const [normal, important, urgent, lastInfo] = await Promise.all([
        prisma.infoShare.count({ where: { ...where, priority: "NORMAL" } }),
        prisma.infoShare.count({ where: { ...where, priority: "IMPORTANT" } }),
        prisma.infoShare.count({ where: { ...where, priority: "URGENT" } }),
        prisma.infoShare.findFirst({
          where,
          orderBy: {
            updatedAt: "desc",
          },
          select: {
            updatedAt: true,
          },
        }),
      ]);

      return {
        name: staff.createdByName,
        serviceNumber: staff.createdByServiceNumber,
        total: staff._count.id,
        normal,
        important,
        urgent,
        lastUpdate: lastInfo?.updatedAt || null,
      };
    })
  );

  return (
    <AppShell
      title="Reports"
      subtitle={
        session.role === "MAIN_ADMIN"
          ? "All region performance and summary"
          : `${session.region} performance and summary`
      }
      user={session}
    >
      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <div className="overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-xl shadow-slate-900/10">
          <div className="relative p-6 sm:p-8">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-500/20 blur-2xl" />
            <div className="absolute bottom-0 left-10 h-32 w-32 rounded-full bg-cyan-400/10 blur-2xl" />

            <div className="relative">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-300">
                Reports
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Performance Overview
              </h2>

              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-300 sm:text-base">
                Evaluate task progress, staff activity, information sharing,
                request types and regional performance.
              </p>
            </div>
          </div>
        </div>

        <SectionTitle
          title="Task Report"
          subtitle="Task status, region progress and staff task updates."
          href="/tasks"
          hrefLabel="Task Records"
        />

        <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-7">
          <ReportCard title="Total" value={totalTasks} />
          <ReportCard title="Today" value={todayTasks} />
          <ReportCard title="This Month" value={monthTasks} />
          <ReportCard title="Pending" value={pendingTasks} />
          <ReportCard title="In Progress" value={inProgressTasks} />
          <ReportCard title="Completed" value={completedTasks} />
          <ReportCard title="Closed" value={closedTasks} />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
            <h3 className="text-xl font-black text-slate-900">
              Region Wise Summary
            </h3>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Compare task progress by region.
            </p>

            <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="p-4 text-left">Region</th>
                      <th className="p-4 text-left">Total</th>
                      <th className="p-4 text-left">Pending</th>
                      <th className="p-4 text-left">In Progress</th>
                      <th className="p-4 text-left">Completed</th>
                      <th className="p-4 text-left">Closed</th>
                    </tr>
                  </thead>

                  <tbody>
                    {regionRows.map((row) => (
                      <tr key={row.region} className="border-t border-slate-100">
                        <td className="p-4 font-black text-slate-900">
                          {row.region}
                        </td>
                        <td className="p-4 font-black text-blue-700">
                          {row.total}
                        </td>
                        <td className="p-4">{row.pending}</td>
                        <td className="p-4">{row.inProgress}</td>
                        <td className="p-4">{row.completed}</td>
                        <td className="p-4">{row.closed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-xl font-black text-slate-900">Request Type</h3>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              Most requested information categories.
            </p>

            <div className="mt-5 space-y-3">
              {requestTypeRows.length === 0 ? (
                <EmptyBox text="No request type data yet." />
              ) : (
                requestTypeRows.map((row) => (
                  <CountRow key={row.name} label={row.name} value={row.count} />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
            <h3 className="text-xl font-black text-slate-900">
              Staff Wise Task Performance
            </h3>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              See who updated how many tasks.
            </p>

            <div className="mt-5 space-y-3">
              {staffRows.length === 0 ? (
                <EmptyBox text="No staff task data yet." />
              ) : (
                staffRows.map((staff) => (
                  <div
                    key={`${staff.serviceNumber}-${staff.region}`}
                    className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h4 className="font-black text-slate-900">
                          {staff.name}
                        </h4>
                        <p className="mt-1 text-xs font-bold text-slate-500">
                          {staff.serviceNumber} • {staff.region}
                        </p>
                      </div>

                      <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-black text-blue-700">
                        {staff.total} tasks
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
                      <MiniCount label="Pending" value={staff.pending} />
                      <MiniCount label="Progress" value={staff.inProgress} />
                      <MiniCount label="Completed" value={staff.completed} />
                      <MiniCount label="Closed" value={staff.closed} />
                      <MiniCount
                        label="Last"
                        value={
                          staff.lastUpdate ? formatDate(staff.lastUpdate) : "-"
                        }
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-xl font-black text-slate-900">Shared To</h3>

              <p className="mt-1 text-sm font-semibold text-slate-500">
                Task sharing destination summary.
              </p>

              <div className="mt-5 space-y-3">
                {sharedToRows.length === 0 ? (
                  <EmptyBox text="No shared-to data yet." />
                ) : (
                  sharedToRows.map((row) => (
                    <CountRow
                      key={row.name}
                      label={row.name}
                      value={row.count}
                    />
                  ))
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-xl font-black text-slate-900">
                Recent Task Updates
              </h3>

              <p className="mt-1 text-sm font-semibold text-slate-500">
                Latest updated tasks.
              </p>

              <div className="mt-5 space-y-3">
                {recentTasks.length === 0 ? (
                  <EmptyBox text="No recent updates." />
                ) : (
                  recentTasks.map((task) => (
                    <Link
                      key={task.id}
                      href="/tasks"
                      className="block rounded-[1.5rem] bg-slate-50 p-4 hover:bg-blue-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black text-slate-900">
                            {task.taskNumber}
                          </p>
                          <p className="mt-1 text-xs font-bold text-slate-500">
                            {task.region} • {task.atoll}
                            {task.island ? ` • ${task.island}` : ""}
                          </p>
                        </div>

                        <StatusBadge status={task.status} />
                      </div>

                      <p className="dhivehi-text line-clamp-2 mt-3 text-sm text-slate-700">
                        {task.description}
                      </p>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <SectionTitle
          title="Information Shared Report"
          subtitle="Information shared to regions or areas outside normal tasks."
          href="/information"
          hrefLabel="Information Records"
        />

        <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-6">
          <ReportCard title="Total Info" value={totalInfo} />
          <ReportCard title="Today" value={todayInfo} />
          <ReportCard title="This Month" value={monthInfo} />
          <ReportCard title="Normal" value={normalInfo} />
          <ReportCard title="Important" value={importantInfo} />
          <ReportCard title="Urgent" value={urgentInfo} />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-xl font-black text-slate-900">
              Shared Area Summary
            </h3>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              Count by information shared area.
            </p>

            <div className="mt-5 space-y-3">
              {infoAreaRows.length === 0 ? (
                <EmptyBox text="No information area data yet." />
              ) : (
                infoAreaRows.map((row) => (
                  <CountRow key={row.name} label={row.name} value={row.count} />
                ))
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
            <h3 className="text-xl font-black text-slate-900">
              Information Added By Users
            </h3>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              See who added shared information records.
            </p>

            <div className="mt-5 space-y-3">
              {infoStaffRows.length === 0 ? (
                <EmptyBox text="No information staff data yet." />
              ) : (
                infoStaffRows.map((staff) => (
                  <div
                    key={`${staff.serviceNumber}-info`}
                    className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h4 className="font-black text-slate-900">
                          {staff.name}
                        </h4>
                        <p className="mt-1 text-xs font-bold text-slate-500">
                          {staff.serviceNumber}
                        </p>
                      </div>

                      <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-black text-blue-700">
                        {staff.total} records
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <MiniCount label="Normal" value={staff.normal} />
                      <MiniCount label="Important" value={staff.important} />
                      <MiniCount label="Urgent" value={staff.urgent} />
                      <MiniCount
                        label="Last"
                        value={
                          staff.lastUpdate ? formatDate(staff.lastUpdate) : "-"
                        }
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-900">
                Latest Shared Information
              </h3>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Latest information records shared to regions or areas.
              </p>
            </div>

            <Link
              href="/information"
              className="rounded-2xl bg-slate-900 px-4 py-2 text-center text-sm font-black text-white"
            >
              View Information
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {recentInfo.length === 0 ? (
              <EmptyBox text="No shared information yet." />
            ) : (
              recentInfo.map((info) => {
                const sharedAreas = info.sharedToAreas
                  .map((item) => item.area.name)
                  .join(", ");

                return (
                  <Link
                    key={info.id}
                    href="/information"
                    className="block rounded-[1.5rem] bg-slate-50 p-4 hover:bg-blue-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="line-clamp-2 break-words font-black text-slate-900">
                          {info.title}
                        </p>
                        <p className="mt-1 text-xs font-bold text-slate-500">
                          {formatDate(info.date)} • {sharedAreas || "-"}
                        </p>
                      </div>

                      <PriorityBadge priority={info.priority} />
                    </div>

                    <p className="dhivehi-text line-clamp-2 mt-3 text-sm text-slate-700">
                      {info.details}
                    </p>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function SectionTitle({
  title,
  subtitle,
  href,
  hrefLabel,
}: {
  title: string;
  subtitle: string;
  href: string;
  hrefLabel: string;
}) {
  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h3 className="text-2xl font-black text-slate-950">{title}</h3>
        <p className="mt-1 text-sm font-semibold text-slate-500">{subtitle}</p>
      </div>

      <Link
        href={href}
        className="rounded-2xl bg-blue-700 px-4 py-2 text-center text-sm font-black text-white shadow-lg shadow-blue-700/20 hover:bg-blue-800"
      >
        {hrefLabel}
      </Link>
    </div>
  );
}

function ReportCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
        {title}
      </p>
      <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function CountRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
      <p className="font-black text-slate-800">{label}</p>
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