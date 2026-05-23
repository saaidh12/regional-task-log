"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const PRIORITIES = ["ALL", "NORMAL", "IMPORTANT", "URGENT"];

type SharedAreaItem = {
  id: string;
  name: string;
};

export type InfoAreaFilterItem = {
  id: string;
  name: string;
  isActive: boolean;
};

export type InformationItem = {
  id: string;
  date: string;
  title: string;
  details: string;
  source: string;
  remarks: string;
  priority: string;
  createdByName: string;
  createdByServiceNumber: string;
  createdByRegion: string;
  createdAt: string;
  updatedAt: string;
  sharedToAreas: SharedAreaItem[];
};

export default function InformationClient({
  records,
  areas,
  session,
  filters,
  pagination,
}: {
  records: InformationItem[];
  areas: InfoAreaFilterItem[];
  session: {
    role: "MAIN_ADMIN" | "STAFF";
    region: string | null;
  };
  filters: {
    q: string;
    area: string;
    priority: string;
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
  const [selectedRecord, setSelectedRecord] =
    useState<InformationItem | null>(null);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const start = Math.max(1, pagination.currentPage - 3);
    const end = Math.min(pagination.totalPages, pagination.currentPage + 4);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }, [pagination.currentPage, pagination.totalPages]);

  const areaOptions =
    session.role === "MAIN_ADMIN"
      ? areas
      : areas.filter((item) => item.name === session.region);

  return (
    <div className="pb-24 lg:pb-8">
      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-950">
              Information Shared
            </h1>
            <p className="mt-2 text-sm font-bold text-slate-500">
              Information received and shared to regions or areas
            </p>
          </div>

          <Link
            href="/information/new"
            className="rounded-2xl bg-blue-700 px-5 py-3 text-center text-sm font-black text-white shadow-lg shadow-blue-700/20 hover:bg-blue-800"
          >
            + Add Information
          </Link>
        </div>

        <div className="rounded-[2rem] border border-blue-100 bg-white p-4 shadow-sm">
          <form className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_150px_150px_170px_170px_auto]">
            <input
              name="q"
              defaultValue={filters.q}
              placeholder="Search title, source, details, area..."
              className="input"
            />

            <input
              type="date"
              name="from"
              defaultValue={filters.from}
              className="input"
            />

            <input
              type="date"
              name="to"
              defaultValue={filters.to}
              className="input"
            />

            <select
              name="priority"
              defaultValue={filters.priority}
              className="input"
            >
              {PRIORITIES.map((item) => (
                <option key={item} value={item}>
                  {item === "ALL" ? "All Priority" : item}
                </option>
              ))}
            </select>

            {session.role === "MAIN_ADMIN" ? (
              <select name="area" defaultValue={filters.area} className="input">
                <option value="ALL">All Areas</option>
                {areaOptions.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                name="area"
                value={session.region || ""}
                readOnly
                className="input bg-slate-100"
              />
            )}

            <button className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800">
              Filter
            </button>
          </form>

          <div className="mt-4 flex flex-col gap-3 text-xs font-bold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing page {pagination.currentPage} of {pagination.totalPages} •{" "}
              {pagination.totalRecords} total records
            </p>

            <div className="flex items-center gap-5">
              <Link href="/information/new" className="text-blue-600">
                Add New
              </Link>
              <Link href="/information" className="text-blue-600">
                Clear
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-sm">
          <div className="hidden grid-cols-[130px_130px_170px_1fr_170px_90px] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-4 text-xs font-black uppercase tracking-wide text-slate-500 lg:grid">
            <div>Date</div>
            <div>Priority</div>
            <div>Shared To</div>
            <div>Title</div>
            <div>Added By</div>
            <div className="text-center">View</div>
          </div>

          {records.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-lg font-black text-slate-900">
                No information records found.
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                Add information or change your filters.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {records.map((record) => (
                <InformationRow
                  key={record.id}
                  record={record}
                  onView={() => setSelectedRecord(record)}
                />
              ))}
            </div>
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

          {pageNumbers.map((page) => (
            <PageButton
              key={page}
              page={page}
              label={String(page)}
              filters={filters}
              active={page === pagination.currentPage}
            />
          ))}

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
        <InformationModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
}

function InformationRow({
  record,
  onView,
}: {
  record: InformationItem;
  onView: () => void;
}) {
  const sharedTo = record.sharedToAreas.length
    ? record.sharedToAreas.map((area) => area.name).join(", ")
    : "-";

  return (
    <div className="grid grid-cols-1 gap-4 px-5 py-5 lg:grid-cols-[130px_130px_170px_1fr_170px_90px] lg:items-center">
      <div>
        <p className="lg:hidden text-xs font-black uppercase tracking-wide text-slate-400">
          Date
        </p>
        <p className="text-sm font-bold text-slate-800">
          {formatDate(record.date)}
        </p>
      </div>

      <div>
        <p className="lg:hidden text-xs font-black uppercase tracking-wide text-slate-400">
          Priority
        </p>
        <span
          className={`inline-flex rounded-2xl px-3 py-2 text-xs font-black ${priorityClass(
            record.priority
          )}`}
        >
          {record.priority}
        </span>
      </div>

      <div>
        <p className="lg:hidden text-xs font-black uppercase tracking-wide text-slate-400">
          Shared To
        </p>
        <p className="break-words text-sm font-black text-slate-900">
          {sharedTo}
        </p>
      </div>

      <div className="min-w-0">
        <p className="lg:hidden text-xs font-black uppercase tracking-wide text-slate-400">
          Title
        </p>
        <p className="line-clamp-2 break-words text-sm font-black text-slate-950">
          {record.title}
        </p>
        <p className="mt-1 line-clamp-1 break-words text-xs font-semibold text-slate-500">
          Source: {record.source || "-"}
        </p>
      </div>

      <div>
        <p className="lg:hidden text-xs font-black uppercase tracking-wide text-slate-400">
          Added By
        </p>
        <p className="truncate text-sm font-black text-slate-900">
          {record.createdByName}
        </p>
        <p className="text-xs font-bold text-slate-400">
          {record.createdByServiceNumber}
        </p>
      </div>

      <div className="flex lg:justify-center">
        <button
          onClick={onView}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-lg hover:bg-blue-100"
          title="View Information"
        >
          👁
        </button>
      </div>
    </div>
  );
}

function InformationModal({
  record,
  onClose,
}: {
  record: InformationItem;
  onClose: () => void;
}) {
  const sharedTo = record.sharedToAreas.length
    ? record.sharedToAreas.map((area) => area.name).join(", ")
    : "-";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[2rem] bg-white shadow-2xl sm:max-h-[88vh] sm:rounded-[2rem]">
        <div className="shrink-0 border-b border-blue-100 bg-white px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-wide text-blue-600">
                Information Details
              </p>

              <h2 className="mt-1 break-words text-2xl font-black text-slate-900">
                {record.title}
              </h2>

              <p className="mt-1 text-sm font-bold text-slate-500">
                {formatDate(record.date)} • {record.priority}
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
            <Info label="Priority" value={record.priority} />
            <Info label="Shared To" value={sharedTo} />
            <Info label="Source" value={record.source || "-"} />
            <Info label="Created By" value={record.createdByName} />
            <Info label="Service No" value={record.createdByServiceNumber} />
            <Info label="Created At" value={formatDateTime(record.createdAt)} />
            <Info label="Updated At" value={formatDateTime(record.updatedAt)} />
          </div>

          <div className="mt-4 overflow-hidden rounded-[1.5rem] bg-slate-50 p-5">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
              Information Details
            </p>

            <p className="dhivehi-text mt-3 max-w-full whitespace-pre-wrap break-words text-base leading-8 text-slate-900 [overflow-wrap:anywhere] sm:text-lg">
              {record.details}
            </p>
          </div>

          <div className="mt-4 overflow-hidden rounded-[1.5rem] bg-blue-50 p-5">
            <p className="text-xs font-black uppercase tracking-wide text-blue-500">
              Remarks
            </p>

            <p className="dhivehi-text mt-3 max-w-full whitespace-pre-wrap break-words text-base leading-8 text-slate-900 [overflow-wrap:anywhere] sm:text-lg">
              {record.remarks || "No remarks added."}
            </p>
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
              href={`/information/${record.id}/edit`}
              className="rounded-2xl bg-blue-700 px-5 py-3 text-center text-sm font-black text-white hover:bg-blue-800"
            >
              Edit Information
            </Link>
          </div>
        </div>
      </div>
    </div>
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
    area: string;
    priority: string;
    from: string;
    to: string;
  };
  active?: boolean;
}) {
  const params = new URLSearchParams();

  if (filters.q) params.set("q", filters.q);
  if (filters.area && filters.area !== "ALL") params.set("area", filters.area);
  if (filters.priority && filters.priority !== "ALL") {
    params.set("priority", filters.priority);
  }
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);

  params.set("page", String(page));

  return (
    <Link
      href={`/information?${params.toString()}`}
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

function priorityClass(priority: string) {
  if (priority === "URGENT") {
    return "bg-red-50 text-red-700";
  }

  if (priority === "IMPORTANT") {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-blue-50 text-blue-700";
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