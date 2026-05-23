"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const REGIONS = ["ALL", "SPR", "SCPR", "NCPR", "NPR", "UNPR"];

type ParticipantItem = {
  id: string;
  displayName: string;
  serviceNo: string;
  region: string;
};

type AssignedTaskItem = {
  id: string;
  assignedToUserId: string;
  assignedToName: string;
  assignedToServiceNo: string;
  assignedToRegion: string;
  taskDetails: string;
  isCompleted: boolean;
};

export type YaumiyyaItem = {
  id: string;
  date: string;
  startTime: string;
  finishedTime: string;
  region: string;
  meetingTitle: string;
  meetingNotes: string;
  assignedTasks: string;
  createdByName: string;
  createdByServiceNumber: string;
  createdAt: string;
  updatedAt: string;
  participants: ParticipantItem[];
  assignedTaskItems: AssignedTaskItem[];
};

export default function YaumiyyaClient({
  records,
  session,
  filters,
  pagination,
}: {
  records: YaumiyyaItem[];
  session: {
    role: "MAIN_ADMIN" | "STAFF";
    region: string | null;
  };
  filters: {
    q: string;
    region: string;
    from: string;
    to: string;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    pageSize: number;
  };
}) {
  const [selectedRecord, setSelectedRecord] = useState<YaumiyyaItem | null>(
    null
  );

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
        <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600 text-white shadow-xl shadow-blue-900/20">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-100">
                  Meeting Notes
                </p>

                <h1 className="mt-3 text-3xl font-black sm:text-4xl">
                  Yaumiyya Records
                </h1>

                <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-blue-100">
                  Search meeting notes, participants, assigned users and daily
                  meeting updates.
                </p>
              </div>

              <Link
                href="/yaumiyya/new"
                className="rounded-2xl bg-white px-5 py-3 text-center text-sm font-black text-blue-700 shadow-lg shadow-blue-950/20 hover:bg-blue-50"
              >
                + Add Yaumiyya
              </Link>
            </div>
          </div>
        </div>

        <details className="group mt-5 rounded-[2rem] border border-blue-100 bg-white p-3 shadow-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-[1.5rem] bg-blue-50 px-4 py-4">
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-900">Filters</p>
              <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
                Search title, notes, participant, assigned user, date and region
              </p>
            </div>

            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-sm font-black text-white transition group-open:rotate-180">
              ↓
            </span>
          </summary>

          <div className="mt-3">
            <form className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_160px_160px_160px_auto]">
              <Field label="Search">
                <input
                  name="q"
                  defaultValue={filters.q}
                  placeholder="Title, notes, participant, assigned user..."
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

              <div className="flex items-end">
                <button className="w-full rounded-2xl bg-blue-700 px-5 py-3 text-sm font-black text-white hover:bg-blue-800">
                  Filter
                </button>
              </div>
            </form>

            <div className="mt-3 flex flex-col gap-3 text-xs font-bold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <p>
                Showing page {pagination.currentPage} of{" "}
                {pagination.totalPages} • {pagination.totalRecords} total
                records
              </p>

              <Link href="/yaumiyya" className="text-blue-600">
                Clear Filters
              </Link>
            </div>
          </div>
        </details>

        <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
          {records.length === 0 ? (
            <div className="rounded-[2rem] border border-blue-100 bg-white p-8 text-center shadow-sm xl:col-span-2">
              <p className="text-lg font-black text-slate-900">
                No Yaumiyya records found.
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                Add a meeting note or change your filters.
              </p>
            </div>
          ) : (
            records.map((record) => (
              <YaumiyyaCard
                key={record.id}
                record={record}
                onView={() => setSelectedRecord(record)}
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

      {selectedRecord && (
        <YaumiyyaModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
}

function YaumiyyaCard({
  record,
  onView,
}: {
  record: YaumiyyaItem;
  onView: () => void;
}) {
  const completedAssigned = record.assignedTaskItems.filter(
    (task) => task.isCompleted
  ).length;

  return (
    <div className="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-950/10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="break-words text-xs font-black uppercase tracking-wide text-blue-600">
            {formatDate(record.date)}
            {record.startTime ? ` • ${record.startTime}` : ""}
            {record.finishedTime ? ` - ${record.finishedTime}` : ""}
          </p>

          <h2 className="mt-2 break-words text-xl font-black text-slate-900">
            {record.meetingTitle || "Yaumiyya Meeting Note"}
          </h2>

          <p className="mt-1 break-words text-xs font-bold text-slate-500">
            Added by {record.createdByName} • {record.createdByServiceNumber}
          </p>
        </div>

        <span className="shrink-0 rounded-2xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-700">
          {record.participants.length} Participants
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniInfo label="Notes" value={record.meetingNotes ? "Added" : "Empty"} />
        <MiniInfo
          label="Assigned"
          value={String(record.assignedTaskItems.length)}
        />
        <MiniInfo label="Completed" value={String(completedAssigned)} />
        <MiniInfo
          label="Pending"
          value={String(record.assignedTaskItems.length - completedAssigned)}
        />
      </div>

      <button
        onClick={onView}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-700 px-4 py-3 text-sm font-black text-white hover:bg-blue-800"
      >
        <span>👁</span>
        View Yaumiyya
      </button>
    </div>
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

function YaumiyyaModal({
  record,
  onClose,
}: {
  record: YaumiyyaItem;
  onClose: () => void;
}) {
  const completedAssigned = record.assignedTaskItems.filter(
    (task) => task.isCompleted
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[2rem] bg-white shadow-2xl sm:max-h-[88vh] sm:rounded-[2rem]">
        <div className="shrink-0 border-b border-blue-100 bg-white px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-wide text-blue-600">
                Yaumiyya Details
              </p>

              <h2 className="mt-1 break-words text-2xl font-black text-slate-900">
                {record.meetingTitle || "Yaumiyya Meeting Note"}
              </h2>

              <p className="mt-1 break-words text-sm font-bold text-slate-500">
                {formatDate(record.date)}
                {record.startTime ? ` • ${record.startTime}` : ""}
                {record.finishedTime ? ` - ${record.finishedTime}` : ""}
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
            <Info label="Date" value={formatDate(record.date)} />
            <Info label="Start Time" value={record.startTime || "-"} />
            <Info label="Finished Time" value={record.finishedTime || "-"} />
            <Info
              label="Participants"
              value={String(record.participants.length)}
            />
            <Info
              label="Assigned Tasks"
              value={String(record.assignedTaskItems.length)}
            />
            <Info label="Completed" value={String(completedAssigned)} />
            <Info label="Created By" value={record.createdByName} />
            <Info label="Service No" value={record.createdByServiceNumber} />
            <Info label="Created At" value={formatDateTime(record.createdAt)} />
            <Info label="Updated At" value={formatDateTime(record.updatedAt)} />
          </div>

          <div className="mt-4 overflow-hidden rounded-[1.5rem] bg-slate-50 p-5">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
              Participants
            </p>

            {record.participants.length === 0 ? (
              <p className="mt-3 text-sm font-bold text-slate-500">
                No participants added.
              </p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {record.participants.map((participant) => (
                  <span
                    key={participant.id}
                    className="max-w-full break-words rounded-2xl bg-white px-4 py-2 text-sm font-black text-slate-700 [overflow-wrap:anywhere]"
                  >
                    {participant.displayName}
                    {participant.serviceNo ? ` (${participant.serviceNo})` : ""}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 overflow-hidden rounded-[1.5rem] bg-slate-50 p-5">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
              Meeting Notes
            </p>

            <p className="dhivehi-text mt-3 max-w-full whitespace-pre-wrap break-words text-base leading-8 text-slate-900 [overflow-wrap:anywhere] sm:text-lg">
              {record.meetingNotes}
            </p>
          </div>

          <div className="mt-4 overflow-hidden rounded-[1.5rem] bg-blue-50 p-5">
            <p className="text-xs font-black uppercase tracking-wide text-blue-500">
              Assigned Tasks
            </p>

            {record.assignedTaskItems.length === 0 ? (
              <p className="mt-3 text-sm font-bold text-blue-900">
                No assigned tasks added.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {record.assignedTaskItems.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-[1.25rem] bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-wide text-blue-500">
                          Assigned To
                        </p>
                        <p className="mt-1 break-words text-sm font-black text-slate-900">
                          {task.assignedToName}
                          {task.assignedToServiceNo
                            ? ` (${task.assignedToServiceNo})`
                            : ""}
                        </p>
                      </div>

                      <span
                        className={`rounded-2xl px-3 py-2 text-xs font-black ${
                          task.isCompleted
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {task.isCompleted ? "Completed" : "Pending"}
                      </span>
                    </div>

                    <p className="dhivehi-text mt-3 max-w-full whitespace-pre-wrap break-words text-base leading-8 text-slate-900 [overflow-wrap:anywhere]">
                      {task.taskDetails}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 border-t border-blue-100 bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              onClick={onClose}
              className="rounded-2xl bg-slate-200 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-300"
            >
              Close
            </button>

            <Link
              href={`/yaumiyya/${record.id}/edit`}
              className="rounded-2xl bg-blue-700 px-5 py-3 text-center text-sm font-black text-white hover:bg-blue-800"
            >
              Edit Yaumiyya
            </Link>
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-slate-50 p-4">
      <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-black text-slate-900 [overflow-wrap:anywhere]">
        {value}
      </p>
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
  filters: {
    q: string;
    region: string;
    from: string;
    to: string;
  };
  active?: boolean;
}) {
  const params = new URLSearchParams();

  if (filters.q) params.set("q", filters.q);
  if (filters.region && filters.region !== "ALL") {
    params.set("region", filters.region);
  }
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);

  params.set("page", String(page));

  return (
    <Link
      href={`/yaumiyya?${params.toString()}`}
      className={`rounded-2xl px-4 py-2 text-sm font-black ${
        active
          ? "bg-blue-700 text-white"
          : "border border-blue-100 bg-white text-slate-700 hover:bg-blue-50"
      }`}
    >
      {label}
    </Link>
  );
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