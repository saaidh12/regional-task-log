"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = ["OPEN", "IN_PROGRESS", "FIXED", "CLOSED", "REJECTED"];

type AttachmentItem = {
  id: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
};

type ReplyItem = {
  id: string;
  message: string;
  createdByName: string;
  createdByServiceNumber: string;
  createdAt: string;
};

type TicketDetail = {
  id: string;
  ticketNumber: string;
  subject: string;
  details: string;
  category: string;
  priority: string;
  status: string;
  adminNote: string;
  createdByName: string;
  createdByServiceNumber: string;
  createdByRegion: string;
  createdAt: string;
  updatedAt: string;
  attachments: AttachmentItem[];
  replies: ReplyItem[];
};

export default function SupportTicketDetailClient({
  ticket,
  userRole,
}: {
  ticket: TicketDetail;
  userRole: "MAIN_ADMIN" | "STAFF";
}) {
  const router = useRouter();

  const [status, setStatus] = useState(ticket.status);
  const [adminNote, setAdminNote] = useState(ticket.adminNote);
  const [replyMessage, setReplyMessage] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function updateTicket() {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`/api/support/${ticket.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          adminNote,
          replyMessage,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update ticket.");
        return;
      }

      setSuccess("Ticket updated successfully.");
      setReplyMessage("");

      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteTicket() {
    const ok = window.confirm(
      `Delete "${ticket.ticketNumber}"? This action cannot be undone.`
    );

    if (!ok) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/support/${ticket.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to delete ticket.");
        return;
      }

      router.push("/support");
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_380px]">
      <div className="space-y-5">
        <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-950 via-blue-800 to-sky-600 text-white shadow-xl shadow-blue-900/20">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-100">
                  {ticket.ticketNumber}
                </p>

                <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                  {ticket.subject}
                </h2>

                <p className="mt-3 text-sm font-semibold text-blue-100">
                  Created by {ticket.createdByName} •{" "}
                  {ticket.createdByServiceNumber}
                </p>
              </div>

              <StatusBadge status={ticket.status} />
            </div>
          </div>
        </div>

        <SectionCard title="Ticket Details">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Info label="Category" value={formatEnum(ticket.category)} />
            <Info label="Priority" value={formatEnum(ticket.priority)} />
            <Info label="Status" value={formatEnum(ticket.status)} />
            <Info label="Region" value={ticket.createdByRegion || "-"} />
            <Info label="Created By" value={ticket.createdByName} />
            <Info label="Service No" value={ticket.createdByServiceNumber} />
            <Info label="Created At" value={formatDateTime(ticket.createdAt)} />
            <Info label="Updated At" value={formatDateTime(ticket.updatedAt)} />
          </div>
        </SectionCard>

        <SectionCard title="Problem / Request Details">
          <p className="dhivehi-text whitespace-pre-wrap break-words text-base leading-8 text-slate-900 [overflow-wrap:anywhere] sm:text-lg">
            {ticket.details}
          </p>
        </SectionCard>

        <SectionCard title="Screenshots / Attachments">
          {ticket.attachments.length === 0 ? (
            <EmptyBox text="No attachments uploaded." />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {ticket.attachments.map((attachment) => (
                <a
                  key={attachment.id}
                  href={attachment.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 hover:bg-blue-50"
                >
                  {attachment.fileType.startsWith("image/") ? (
                    <img
                      src={attachment.fileUrl}
                      alt={attachment.fileName}
                      className="mb-3 h-40 w-full rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="mb-3 flex h-40 items-center justify-center rounded-2xl bg-white text-4xl">
                      📄
                    </div>
                  )}

                  <p className="truncate text-sm font-black text-slate-900">
                    {attachment.fileName}
                  </p>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    {formatFileSize(attachment.fileSize)}
                  </p>
                </a>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Replies">
          {ticket.replies.length === 0 ? (
            <EmptyBox text="No replies yet." />
          ) : (
            <div className="space-y-3">
              {ticket.replies.map((reply) => (
                <div
                  key={reply.id}
                  className="rounded-[1.5rem] bg-slate-50 p-4"
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-black text-slate-900">
                      {reply.createdByName}
                    </p>
                    <p className="text-xs font-bold text-slate-400">
                      {formatDateTime(reply.createdAt)}
                    </p>
                  </div>

                  <p className="mt-2 text-xs font-bold text-slate-500">
                    {reply.createdByServiceNumber}
                  </p>

                  <p className="dhivehi-text mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-800 [overflow-wrap:anywhere]">
                    {reply.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <aside className="space-y-5 xl:sticky xl:top-24 xl:h-fit">
        <div className="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-black text-slate-900">
            Update Ticket
          </h3>

          {userRole === "MAIN_ADMIN" && (
            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-black text-slate-700">
                  Status
                </span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="input"
                >
                  {STATUSES.map((item) => (
                    <option key={item} value={item}>
                      {formatEnum(item)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-black text-slate-700">
                  Admin Note
                </span>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={4}
                  className="input resize-none"
                  placeholder="Internal/admin note..."
                />
              </label>
            </div>
          )}

          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-black text-slate-700">
              Reply
            </span>
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              rows={5}
              dir="auto"
              className="input dhivehi-text resize-none"
              placeholder="Write reply..."
            />
          </label>

          {error && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">
              {success}
            </div>
          )}

          <button
            onClick={updateTicket}
            disabled={loading}
            className="mt-4 w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Update Ticket"}
          </button>

          {userRole === "MAIN_ADMIN" && (
            <button
              onClick={deleteTicket}
              disabled={loading}
              className="mt-3 w-full rounded-2xl bg-red-50 px-5 py-3 text-sm font-black text-red-700 hover:bg-red-100 disabled:opacity-60"
            >
              Delete Ticket
            </button>
          )}
        </div>

        <Link
          href="/support"
          className="block rounded-2xl bg-slate-900 px-5 py-3 text-center text-sm font-black text-white"
        >
          Back to Tickets
        </Link>
      </aside>
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
      <h3 className="mb-4 text-xl font-black text-slate-900">{title}</h3>
      {children}
    </section>
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

function EmptyBox({ text }: { text: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 text-center text-sm font-bold text-slate-500">
      {text}
    </div>
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
      className={`inline-flex shrink-0 rounded-2xl px-4 py-2 text-xs font-black ${classes}`}
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

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatFileSize(size: number) {
  if (!size) return "0 KB";

  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}