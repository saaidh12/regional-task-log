"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  { value: "BUG", label: "Bug" },
  { value: "CHANGE_REQUEST", label: "Change Request" },
  { value: "LOGIN_ISSUE", label: "Login Issue" },
  { value: "DATA_ISSUE", label: "Data Issue" },
  { value: "IMAGE_UPLOAD", label: "Image Upload" },
  { value: "OTHER", label: "Other" },
];

const PRIORITIES = [
  { value: "LOW", label: "Low" },
  { value: "NORMAL", label: "Normal" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

type AttachmentItem = {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
};

export default function CreateSupportTicketForm() {
  const router = useRouter();

  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [category, setCategory] = useState("BUG");
  const [priority, setPriority] = useState("NORMAL");
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const totalSize = useMemo(() => {
    return attachments.reduce((sum, item) => sum + item.fileSize, 0);
  }, [attachments]);

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    setError("");
    setUploading(true);

    try {
      const uploaded: AttachmentItem[] = [];

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/support/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to upload file.");
          return;
        }

        uploaded.push(data.attachment);
      }

      setAttachments([...attachments, ...uploaded]);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function removeAttachment(index: number) {
    setAttachments(attachments.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject,
          details,
          category,
          priority,
          attachments,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create support ticket.");
        return;
      }

      setSuccess("Support ticket created successfully.");

      setTimeout(() => {
        router.push("/support");
        router.refresh();
      }, 700);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-950 via-blue-800 to-sky-600 text-white shadow-xl shadow-blue-900/20">
          <div className="p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-100">
              Tech Support
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Create Ticket
            </h2>

            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-blue-100">
              Upload screenshots and explain the problem clearly.
            </p>
          </div>
        </div>

        <SectionCard
          number="01"
          title="Ticket Details"
          subtitle="Select category, priority and write a subject."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Category">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input"
              >
                {CATEGORIES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Priority">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="input"
              >
                {PRIORITIES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>

            <div className="md:col-span-2">
              <Field label="Subject">
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Example: Cannot upload person photo"
                  className="input"
                />
              </Field>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          number="02"
          title="Problem / Request Details"
          subtitle="Explain what happened or what change is needed."
        >
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={8}
            dir="auto"
            placeholder="Write issue details..."
            className="input dhivehi-text resize-none text-lg leading-9"
          />
        </SectionCard>

        <SectionCard
          number="03"
          title="Screenshots / Attachments"
          subtitle="Upload screenshots. JPG, PNG, WEBP or PDF. Max 10MB each."
        >
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={(e) => uploadFiles(e.target.files)}
            className="input"
          />

          {uploading && (
            <div className="mt-3 rounded-2xl bg-blue-50 p-4 text-sm font-black text-blue-700">
              Uploading...
            </div>
          )}

          {attachments.length > 0 && (
            <div className="mt-4 space-y-2">
              {attachments.map((attachment, index) => (
                <div
                  key={`${attachment.fileUrl}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-900">
                      {attachment.fileName}
                    </p>
                    <p className="text-xs font-bold text-slate-500">
                      {formatFileSize(attachment.fileSize)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-700 hover:bg-red-100"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">
            {success}
          </div>
        )}

        <div className="sticky bottom-20 z-20 rounded-[1.5rem] border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.push("/support")}
              className="rounded-2xl bg-slate-200 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-300"
            >
              Cancel
            </button>

            <button
              disabled={loading || uploading}
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Ticket"}
            </button>
          </div>
        </div>
      </form>

      <aside className="space-y-4 xl:sticky xl:top-24 xl:h-fit">
        <div className="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-black text-slate-900">Summary</h3>

          <div className="mt-4 space-y-3">
            <Info label="Category" value={formatEnum(category)} />
            <Info label="Priority" value={formatEnum(priority)} />
            <Info label="Screenshots" value={String(attachments.length)} />
            <Info label="Total Size" value={formatFileSize(totalSize)} />
          </div>
        </div>

        <div className="rounded-[2rem] border border-blue-100 bg-blue-50 p-5 text-sm font-semibold leading-6 text-blue-900">
          Support tickets are for bugs, change requests, login problems, data
          issues and image upload problems.
        </div>
      </aside>
    </div>
  );
}

function SectionCard({
  number,
  title,
  subtitle,
  children,
}: {
  number: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-sm font-black text-blue-700">
          {number}
        </div>

        <div>
          <h3 className="text-xl font-black text-slate-900">{title}</h3>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
            {subtitle}
          </p>
        </div>
      </div>

      {children}
    </section>
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
      <span className="mb-2 block text-sm font-black text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-black text-slate-900">
        {value}
      </p>
    </div>
  );
}

function formatEnum(value: string) {
  return value
    .split("_")
    .map((item) => item.charAt(0) + item.slice(1).toLowerCase())
    .join(" ");
}

function formatFileSize(size: number) {
  if (!size) return "0 KB";

  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}