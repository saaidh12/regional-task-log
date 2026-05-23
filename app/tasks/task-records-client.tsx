"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const REGIONS = ["ALL", "SPR", "SCPR", "NCPR", "NPR", "UNPR"];
const STATUS = ["ALL", "PENDING", "IN_PROGRESS", "COMPLETED", "CLOSED"];

type OptionItem = {
  id: string;
  name: string;
};

export type TaskItem = {
  id: string;
  createdByUserId: string;
  taskNumber: string;
  date: string;
  region: string;
  atoll: string;
  island: string;
  description: string;
  informationProvided: string;
  informationProvidedDate: string;
  status: string;
  createdByName: string;
  createdByServiceNumber: string;
  createdAt: string;
  updatedAt: string;
  sharedToOptions: OptionItem[];
  requestTypeOptions: OptionItem[];
};

export type TaskRecordsClientProps = {
  tasks: TaskItem[];
  session: {
    id: string;
    role: "MAIN_ADMIN" | "STAFF";
    region: string | null;
  };
  filters: {
    q: string;
    region: string;
    status: string;
    from: string;
    to: string;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalTasks: number;
    pageSize: number;
  };
};

export default function TaskRecordsClient({
  tasks,
  session,
  filters,
  pagination,
}: TaskRecordsClientProps) {
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const start = Math.max(1, pagination.currentPage - 3);
    const end = Math.min(pagination.totalPages, pagination.currentPage + 4);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }, [pagination.currentPage, pagination.totalPages]);

  return (
    <div className="pb-24 lg:pb-8">
      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <div className="mb-5 overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600 text-white shadow-xl shadow-blue-900/20">
          <div className="p-5 sm:p-7">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-100">
              Task Records
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-tight">
              Regional Task Records
            </h1>

            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-blue-100">
              Search, filter, view and export regional task information.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/tasks/new"
                className="rounded-2xl bg-white px-5 py-3 text-center text-sm font-black text-blue-700 shadow-lg shadow-blue-950/20 hover:bg-blue-50"
              >
                + Add Task
              </Link>

              <Link
                href={buildExportUrl(filters)}
                className="rounded-2xl bg-white/10 px-5 py-3 text-center text-sm font-black text-white ring-1 ring-white/20 hover:bg-white/20"
              >
                Export CSV
              </Link>
            </div>
          </div>
        </div>

        <details className="group mb-5 rounded-[2rem] border border-blue-100 bg-white p-3 shadow-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-[1.5rem] bg-blue-50 px-4 py-4">
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-900">Filters</p>
              <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
                Search task, date, region and status
              </p>
            </div>

            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-sm font-black text-white transition group-open:rotate-180">
              ↓
            </span>
          </summary>

          <div className="mt-3">
            <form className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_150px_150px_150px_160px_auto]">
              <Field label="Search">
                <input
                  name="q"
                  defaultValue={filters.q}
                  placeholder="Task no, atoll, island, Dhivehi text..."
                  className="input w-full"
                />
              </Field>

              <Field label="From Date">
                <input
                  type="date"
                  name="from"
                  defaultValue={filters.from}
                  className="input w-full"
                />
              </Field>

              <Field label="To Date">
                <input
                  type="date"
                  name="to"
                  defaultValue={filters.to}
                  className="input w-full"
                />
              </Field>

              <Field label="Region">
                {session.role === "MAIN_ADMIN" ? (
                  <select
                    name="region"
                    defaultValue={filters.region}
                    className="input w-full"
                  >
                    {REGIONS.map((item) => (
                      <option key={item} value={item}>
                        {item === "ALL" ? "All Regions" : item}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    name="region"
                    value={session.region || ""}
                    readOnly
                    className="input w-full bg-slate-100"
                  />
                )}
              </Field>

              <Field label="Status">
                <select
                  name="status"
                  defaultValue={filters.status}
                  className="input w-full"
                >
                  {STATUS.map((item) => (
                    <option key={item} value={item}>
                      {formatStatus(item)}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="flex items-end">
                <button className="w-full rounded-2xl bg-blue-700 px-5 py-3 text-sm font-black text-white hover:bg-blue-800">
                  Filter
                </button>
              </div>
            </form>

            <div className="mt-3 flex flex-col gap-3 text-xs font-bold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <p>
                Showing page {pagination.currentPage} of{" "}
                {pagination.totalPages} • {pagination.totalTasks} total records
              </p>

              <div className="flex items-center gap-3">
                <Link
                  href={buildExportUrl(filters)}
                  className="text-emerald-600"
                >
                  Export CSV
                </Link>

                <Link href="/tasks" className="text-blue-600">
                  Clear
                </Link>
              </div>
            </div>
          </div>
        </details>

        <div className="hidden overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-sm lg:block">
          <table className="w-full table-fixed text-sm">
            <thead className="bg-blue-50/70 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="w-[115px] p-4 text-left">Task No</th>
                <th className="w-[100px] p-4 text-left">Date</th>
                <th className="w-[75px] p-4 text-left">Region</th>
                <th className="w-[70px] p-4 text-left">Atoll</th>
                <th className="p-4 text-left">Description</th>
                <th className="w-[120px] p-4 text-left">Added By</th>
                <th className="w-[115px] p-4 text-left">Status</th>
                <th className="w-[80px] p-4 text-center">View</th>
              </tr>
            </thead>

            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No task records found.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="border-t border-blue-50 hover:bg-blue-50/40"
                  >
                    <td className="p-4 align-top font-black text-slate-900">
                      <span className="block break-words leading-6">
                        {task.taskNumber}
                      </span>
                    </td>

                    <td className="p-4 align-top text-slate-600">
                      {formatDate(task.date)}
                    </td>

                    <td className="p-4 align-top font-bold text-slate-700">
                      {task.region}
                    </td>

                    <td className="p-4 align-top font-bold text-slate-700">
                      {task.atoll}
                    </td>

                    <td className="p-4 align-top">
                      <p className="dhivehi-text line-clamp-1 break-words text-sm text-slate-800 [overflow-wrap:anywhere]">
                        {shortText(task.description, 55)}
                      </p>
                    </td>

                    <td className="p-4 align-top text-slate-600">
                      <p className="truncate font-bold text-slate-800">
                        {task.createdByName}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {task.createdByServiceNumber}
                      </p>
                    </td>

                    <td className="p-4 align-top">
                      <StatusBadge status={task.status} />
                    </td>

                    <td className="p-4 align-top text-center">
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-lg font-black text-blue-700 hover:bg-blue-100"
                        title="View full task"
                      >
                        👁
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:hidden">
          {tasks.length === 0 ? (
            <div className="rounded-[2rem] border border-blue-100 bg-white p-8 text-center text-slate-500 shadow-sm">
              No task records found.
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onView={() => setSelectedTask(task)}
              />
            ))
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {pagination.currentPage > 1 && (
            <PageButton
              page={pagination.currentPage - 1}
              label="Prev"
              filters={filters}
            />
          )}

          {pageNumbers[0] > 1 && (
            <>
              <PageButton page={1} label="1" filters={filters} />
              <span className="px-2 text-slate-400">...</span>
            </>
          )}

          {pageNumbers.map((page) => (
            <PageButton
              key={page}
              page={page}
              label={String(page)}
              filters={filters}
              active={page === pagination.currentPage}
            />
          ))}

          {pageNumbers[pageNumbers.length - 1] < pagination.totalPages && (
            <>
              <span className="px-2 text-slate-400">...</span>
              <PageButton
                page={pagination.totalPages}
                label={String(pagination.totalPages)}
                filters={filters}
              />
            </>
          )}

          {pagination.currentPage < pagination.totalPages && (
            <PageButton
              page={pagination.currentPage + 1}
              label="Next"
              filters={filters}
            />
          )}
        </div>
      </section>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          session={session}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}

function TaskCard({ task, onView }: { task: TaskItem; onView: () => void }) {
  return (
    <div className="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-950/10">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wide text-blue-600">
            {formatDate(task.date)}
          </p>

          <h2 className="mt-2 break-words text-xl font-black text-slate-900">
            {task.taskNumber}
          </h2>

          <p className="mt-1 break-words text-xs font-bold text-slate-500">
            {task.region} • {task.atoll}
            {task.island ? ` • ${task.island}` : ""}
          </p>
        </div>

        <StatusBadge status={task.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <MiniInfo label="Shared To" value={String(task.sharedToOptions.length)} />
        <MiniInfo
          label="Request Type"
          value={String(task.requestTypeOptions.length)}
        />
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl bg-slate-50 p-4">
        <p className="text-xs font-black uppercase tracking-wide text-slate-400">
          Description
        </p>

        <p className="dhivehi-text line-clamp-2 mt-2 max-w-full whitespace-pre-wrap break-words text-base leading-7 text-slate-900 [overflow-wrap:anywhere]">
          {task.description}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Info label="Added By" value={task.createdByName} />
        <Info label="Service No" value={task.createdByServiceNumber} />
      </div>

      <button
        onClick={onView}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-700 px-4 py-3 text-center text-sm font-black text-white hover:bg-blue-800"
      >
        <span>👁</span>
        View Task
      </button>
    </div>
  );
}

function TaskModal({
  task,
  session,
  onClose,
}: {
  task: TaskItem;
  session: TaskRecordsClientProps["session"];
  onClose: () => void;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const canEdit =
    session.role === "MAIN_ADMIN" || task.createdByUserId === session.id;

  const canDelete = session.role === "MAIN_ADMIN";

  async function deleteTask() {
    const ok = window.confirm(
      `Delete task ${task.taskNumber}? This action cannot be undone.`
    );

    if (!ok) return;

    setDeleting(true);

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to delete task.");
        return;
      }

      onClose();
      router.refresh();
    } catch {
      alert("Network error.");
    } finally {
      setDeleting(false);
    }
  }

  const infoText = task.informationProvided?.trim()
    ? task.informationProvided
    : "No information provided yet.";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[2rem] bg-white shadow-2xl sm:max-h-[88vh] sm:rounded-[2rem]">
        <div className="shrink-0 border-b border-blue-100 bg-white px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-wide text-blue-600">
                Task Details
              </p>

              <h2 className="mt-1 break-words text-2xl font-black text-slate-900 sm:text-3xl">
                {task.taskNumber}
              </h2>

              <p className="mt-1 text-sm font-bold text-slate-500">
                {formatDate(task.date)} • {task.region} • {task.atoll}
                {task.island ? ` • ${task.island}` : ""}
              </p>
            </div>

            <button
              onClick={onClose}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-xl font-black text-slate-700 hover:bg-slate-200"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-5">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Info label="Date" value={formatDate(task.date)} />
            <Info label="Region" value={task.region} />
            <Info label="Atoll" value={task.atoll} />
            <Info label="Island" value={task.island || "-"} />

            <Info
              label="Info Date"
              value={
                task.informationProvidedDate
                  ? formatDate(task.informationProvidedDate)
                  : "-"
              }
            />

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                Status
              </p>
              <div className="mt-2">
                <StatusBadge status={task.status} />
              </div>
            </div>
          </div>

          <TagSection
            title="Information Shared To"
            items={task.sharedToOptions}
            emptyText="No shared-to option selected."
          />

          <TagSection
            title="Request Type"
            items={task.requestTypeOptions}
            emptyText="No request type selected."
          />

          <div className="mt-4 overflow-hidden rounded-[1.5rem] bg-slate-50 p-5">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
              Task Description
            </p>

            <p className="dhivehi-text mt-3 whitespace-pre-wrap break-words text-base leading-8 text-slate-900 [overflow-wrap:anywhere] sm:text-lg">
              {task.description}
            </p>
          </div>

          <div className="mt-4 overflow-hidden rounded-[1.5rem] bg-blue-50 p-5">
            <p className="text-xs font-black uppercase tracking-wide text-blue-500">
              Information Provided
            </p>

            <p className="dhivehi-text mt-3 whitespace-pre-wrap break-words text-base leading-8 text-slate-900 [overflow-wrap:anywhere] sm:text-lg">
              {infoText}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Info label="Created By" value={task.createdByName} />
            <Info label="Service Number" value={task.createdByServiceNumber} />
            <Info label="Created At" value={formatDateTime(task.createdAt)} />
            <Info label="Updated At" value={formatDateTime(task.updatedAt)} />
          </div>
        </div>

        <div className="shrink-0 border-t border-blue-100 bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            {canDelete && (
              <button
                onClick={deleteTask}
                disabled={deleting}
                className="rounded-2xl bg-red-50 px-5 py-3 text-sm font-black text-red-700 hover:bg-red-100 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete Task"}
              </button>
            )}

            {canEdit && (
              <Link
                href={`/tasks/${task.id}/edit`}
                className="rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-black text-white hover:bg-blue-700"
              >
                Edit Task
              </Link>
            )}

            <button
              onClick={onClose}
              className="rounded-2xl bg-slate-200 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-slate-900">{value}</p>
    </div>
  );
}

function TagSection({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: OptionItem[];
  emptyText: string;
}) {
  return (
    <div className="mt-4 overflow-hidden rounded-[1.5rem] bg-slate-50 p-5">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
        {title}
      </p>

      {items.length === 0 ? (
        <p className="mt-3 text-sm font-bold text-slate-500">{emptyText}</p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item.id}
              className="rounded-2xl bg-white px-4 py-2 text-sm font-black text-slate-700"
            >
              {item.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function PageButton({
  page,
  label,
  filters,
  active = false,
}: {
  page: number;
  label: string;
  filters: TaskRecordsClientProps["filters"];
  active?: boolean;
}) {
  const params = new URLSearchParams();

  if (filters.q) params.set("q", filters.q);
  if (filters.region && filters.region !== "ALL") {
    params.set("region", filters.region);
  }
  if (filters.status && filters.status !== "ALL") {
    params.set("status", filters.status);
  }
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);

  params.set("page", String(page));

  return (
    <Link
      href={`/tasks?${params.toString()}`}
      className={`rounded-2xl px-4 py-2 text-sm font-black ${
        active
          ? "bg-blue-600 text-white"
          : "border border-blue-100 bg-white text-slate-700 hover:bg-blue-50"
      }`}
    >
      {label}
    </Link>
  );
}

function buildExportUrl(filters: TaskRecordsClientProps["filters"]) {
  const params = new URLSearchParams();

  if (filters.q) params.set("q", filters.q);
  if (filters.region && filters.region !== "ALL") {
    params.set("region", filters.region);
  }
  if (filters.status && filters.status !== "ALL") {
    params.set("status", filters.status);
  }
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);

  const query = params.toString();
  return query ? `/api/tasks/export?${query}` : "/api/tasks/export";
}

function shortText(text: string, limit = 45) {
  const clean = String(text || "").trim();

  if (clean.length <= limit) {
    return clean;
  }

  return clean.slice(0, limit) + "...";
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatStatus(status: string) {
  if (status === "ALL") return "All Status";
  if (status === "PENDING") return "Pending";
  if (status === "IN_PROGRESS") return "In Progress";
  if (status === "COMPLETED") return "Completed";
  if (status === "CLOSED") return "Closed";
  return status;
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-black text-slate-900 [overflow-wrap:anywhere]">
        {value}
      </p>
    </div>
  );
}