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
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-950">
              Support Tickets
            </h1>
            <p className="mt-2 text-sm font-bold text-slate-500">
              {session.role === "MAIN_ADMIN"
                ? "View, reply and manage all user support tickets."
                : "Create and track your support tickets."}
            </p>
          </div>

          <Link
            href="/support/new"
            className="rounded-2xl bg-blue-700 px-5 py-3 text-center text-sm font-black text-white shadow-lg shadow-blue-700/20 hover:bg-blue-800"
          >
            + Create Ticket
          </Link>
        </div>

        <div className="rounded-[2rem] border border-blue-100 bg-white p-4 shadow-sm">
          <form className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_160px_160px_180px_auto]">
            <input
              name="q"
              defaultValue={filters.q}
              placeholder="Search ticket number, subject, user..."
              className="input"
            />

            <select name="status" defaultValue={filters.status} className="input">
              {STATUSES.map((item) => (
                <option key={item} value={item}>
                  {item === "ALL" ? "All Status" : formatEnum(item)}
                </option>
              ))}
            </select>

            <select
              name="priority"
              defaultValue={filters.priority}
              className="input"
            >
              {PRIORITIES.map((item) => (
                <option key={item} value={item}>
                  {item === "ALL" ? "All Priority" : formatEnum(item)}
                </option>
              ))}
            </select>

            <select
              name="category"
              defaultValue={filters.category}
              className="input"
            >
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item === "ALL" ? "All Category" : formatEnum(item)}
                </option>
              ))}
            </select>

            <button className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800">
              Filter
            </button>
          </form>

          <div className="mt-4 flex flex-col gap-3 text-xs font-bold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing page {pagination.currentPage} of {pagination.totalPages} •{" "}
              {pagination.totalTickets} total tickets
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

        <div className="mt-5 overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-sm">
          <div className="hidden grid-cols-[150px_130px_150px_1fr_170px_90px] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-4 text-xs font-black uppercase tracking-wide text-slate-500 lg:grid">
            <div>Ticket</div>
            <div>Status</div>
            <div>Priority</div>
            <div>Subject</div>
            <div>Created By</div>
            <div className="text-center">View</div>
          </div>

          {tickets.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-lg font-black text-slate-900">
                No support tickets found.
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                Create a ticket or change your filters.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {tickets.map((ticket) => (
                <TicketRow key={ticket.id} ticket={ticket} />
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
    </div>
  );
}

function TicketRow({ ticket }: { ticket: SupportTicketItem }) {
  return (
    <div className="grid grid-cols-1 gap-4 px-5 py-5 lg:grid-cols-[150px_130px_150px_1fr_170px_90px] lg:items-center">
      <div>
        <p className="lg:hidden text-xs font-black uppercase tracking-wide text-slate-400">
          Ticket
        </p>
        <p className="text-sm font-black text-blue-700">
          {ticket.ticketNumber}
        </p>
        <p className="text-xs font-bold text-slate-400">
          {formatDate(ticket.createdAt)}
        </p>
      </div>

      <div>
        <p className="lg:hidden text-xs font-black uppercase tracking-wide text-slate-400">
          Status
        </p>
        <StatusBadge status={ticket.status} />
      </div>

      <div>
        <p className="lg:hidden text-xs font-black uppercase tracking-wide text-slate-400">
          Priority
        </p>
        <PriorityBadge priority={ticket.priority} />
      </div>

      <div className="min-w-0">
        <p className="lg:hidden text-xs font-black uppercase tracking-wide text-slate-400">
          Subject
        </p>
        <p className="line-clamp-2 break-words text-sm font-black text-slate-950">
          {ticket.subject}
        </p>
        <p className="mt-1 text-xs font-bold text-slate-500">
          {formatEnum(ticket.category)} • {ticket.attachmentCount} attachment(s)
          • {ticket.replyCount} reply
        </p>
      </div>

      <div>
        <p className="lg:hidden text-xs font-black uppercase tracking-wide text-slate-400">
          Created By
        </p>
        <p className="truncate text-sm font-black text-slate-900">
          {ticket.createdByName}
        </p>
        <p className="text-xs font-bold text-slate-400">
          {ticket.createdByServiceNumber}
        </p>
      </div>

      <div className="flex lg:justify-center">
        <Link
          href={`/support/${ticket.id}`}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-lg hover:bg-blue-100"
          title="View Ticket"
        >
          👁
        </Link>
      </div>
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
      className={`inline-flex rounded-2xl px-3 py-2 text-xs font-black ${classes}`}
    >
      {formatEnum(status)}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const classes =
    priority === "URGENT"
      ? "bg-red-50 text-red-700"
      : priority === "HIGH"
        ? "bg-amber-50 text-amber-700"
        : priority === "LOW"
          ? "bg-slate-100 text-slate-700"
          : "bg-blue-50 text-blue-700";

  return (
    <span
      className={`inline-flex rounded-2xl px-3 py-2 text-xs font-black ${classes}`}
    >
      {formatEnum(priority)}
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