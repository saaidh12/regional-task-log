"use client";

import Link from "next/link";
import { useMemo } from "react";

const STATUSES = ["ALL", "OPEN", "IN_PROGRESS", "FIXED", "CLOSED", "REJECTED"];
const PRIORITIES = ["ALL", "LOW", "NORMAL", "HIGH", "URGENT"];
const CATEGORIES = [
  "ALL",
  "BUG",
  "CHANGE_REQUEST",
  "LOGIN_ISSUE",
  "DATA_ISSUE",
  "IMAGE_UPLOAD",
  "OTHER",
];

export type SupportTicketItem = {
  id: string;
  ticketNumber: string;
  subject: string;
  details: string;
  category: string;
  priority: string;
  status: string;
  createdByName: string;
  createdByServiceNumber: string;
  createdByRegion: string;
  createdAt: string;
  updatedAt: string;
  attachmentCount: number;
  replyCount: number;
};

export default function SupportClient({
  tickets,
  session,
  filters,
  pagination,
}: {
  tickets: SupportTicketItem[];
  session: {
    role: "MAIN_ADMIN" | "STAFF";
    region: string | null;
  };
  filters: {
    q: string;
    status: string;
    priority: string;
    category: string;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalTickets: number;
    pageSize: number;
  };
}) {
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
              Support Tickets
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-tight">
              {session.role === "MAIN_ADMIN"
                ? "All Support Tickets"
                : "My Support Tickets"}
            </h1>

            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-blue-100">
              {session.role === "MAIN_ADMIN"
                ? "View, reply and manage all user support tickets."
                : "Create and track your support tickets."}
            </p>

            <div className="mt-5">
              <Link
                href="/support/new"
                className="inline-flex rounded-2xl bg-white px-5 py-3 text-center text-sm font-black text-blue-700 shadow-lg shadow-blue-950/20 hover:bg-blue-50"
              >
                + Create Ticket
              </Link>
            </div>
          </div>
        </div>

        <details className="group rounded-[2rem] border border-blue-100 bg-white p-3 shadow-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-[1.5rem] bg-blue-50 px-4 py-4">
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-900">Filters</p>
              <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
                Search tickets, status, priority and category
              </p>
            </div>

            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-sm font-black text-white transition group-open:rotate-180">
              ↓
            </span>
          </summary>

          <div className="mt-3">
            <form className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_160px_160px_180px_auto]">
              <Field label="Search">
                <input
                  name="q"
                  defaultValue={filters.q}
                  placeholder="Ticket number, subject, user..."
                  className="input w-full"
                />
              </Field>

              <Field label="Status">
                <select
                  name="status"
                  defaultValue={filters.status}
                  className="input w-full"
                >
                  {STATUSES.map((item) => (
                    <option key={item} value={item}>
                      {item === "ALL" ? "All Status" : formatEnum(item)}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Priority">
                <select
                  name="priority"
                  defaultValue={filters.priority}
                  className="input w-full"
                >
                  {PRIORITIES.map((item) => (
                    <option key={item} value={item}>
                      {item === "ALL" ? "All Priority" : formatEnum(item)}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Category">
                <select
                  name="category"
                  defaultValue={filters.category}
                  className="input w-full"
                >
                  {CATEGORIES.map((item) => (
                    <option key={item} value={item}>
                      {item === "ALL" ? "All Category" : formatEnum(item)}
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

            <div className="mt-4 flex flex-col gap-3 text-xs font-bold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <p>
                Showing page {pagination.currentPage} of{" "}
                {pagination.totalPages} • {pagination.totalTickets} total
                tickets
              </p>

              <div className="flex items-center gap-5">
                <Link href="/support/new" className="text-blue-600">
                  New Ticket
                </Link>
                <Link href="/support" className="text-blue-600">
                  Clear
                </Link>
              </div>
            </div>
          </div>
        </details>

        <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
          {tickets.length === 0 ? (
            <div className="rounded-[2rem] border border-blue-100 bg-white p-8 text-center shadow-sm xl:col-span-2">
              <p className="text-lg font-black text-slate-900">
                No support tickets found.
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                Create a ticket or change your filters.
              </p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
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
    </div>
  );
}

function TicketCard({ ticket }: { ticket: SupportTicketItem }) {
  return (
    <div className="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-950/10">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wide text-blue-600">
            {ticket.ticketNumber}
          </p>

          <h2 className="mt-2 line-clamp-2 break-words text-xl font-black text-slate-900 [overflow-wrap:anywhere]">
            {ticket.subject}
          </h2>

          <p className="mt-1 text-xs font-bold text-slate-500">
            {formatDate(ticket.createdAt)} • {formatEnum(ticket.category)}
          </p>
        </div>

        <StatusBadge status={ticket.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <MiniInfo label="Priority" value={formatEnum(ticket.priority)} />
        <MiniInfo label="Created By" value={ticket.createdByName} />
        <MiniInfo label="Screenshots" value={String(ticket.attachmentCount)} />
        <MiniInfo label="Replies" value={String(ticket.replyCount)} />
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl bg-slate-50 p-4">
        <p className="text-xs font-black uppercase tracking-wide text-slate-400">
          Details
        </p>

        <p className="line-clamp-2 mt-2 max-w-full whitespace-pre-wrap break-words text-base leading-7 text-slate-900 [overflow-wrap:anywhere]">
          {ticket.details}
        </p>
      </div>

      <Link
        href={`/support/${ticket.id}`}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-700 px-4 py-3 text-center text-sm font-black text-white hover:bg-blue-800"
      >
        <span>👁</span>
        View Ticket
      </Link>
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
      <p className="mt-1 line-clamp-1 break-words text-sm font-black text-slate-900">
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
    status: string;
    priority: string;
    category: string;
  };
  active?: boolean;
}) {
  const params = new URLSearchParams();

  if (filters.q) params.set("q", filters.q);
  if (filters.status && filters.status !== "ALL") {
    params.set("status", filters.status);
  }
  if (filters.priority && filters.priority !== "ALL") {
    params.set("priority", filters.priority);
  }
  if (filters.category && filters.category !== "ALL") {
    params.set("category", filters.category);
  }

  params.set("page", String(page));

  return (
    <Link
      href={`/support?${params.toString()}`}
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

function StatusBadge({ status }: { status: string }) {
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
      {formatEnum(status)}
    </span>
  );
}

function formatEnum(value: string) {
  return value
    .split("_")
    .map((item) => item.charAt(0) + item.slice(1).toLowerCase())
    .join(" ");
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}