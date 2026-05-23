"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type AreaItem = {
  id: string;
  name: string;
};

type InformationEditData = {
  id: string;
  date: string;
  title: string;
  details: string;
  source: string;
  remarks: string;
  priority: string;
  selectedAreaIds: string[];
};

const PRIORITIES = [
  { value: "NORMAL", label: "Normal" },
  { value: "IMPORTANT", label: "Important" },
  { value: "URGENT", label: "Urgent" },
];

export default function EditInformationForm({
  record,
  areas,
  userRole,
}: {
  record: InformationEditData;
  areas: AreaItem[];
  userRole: "MAIN_ADMIN" | "STAFF";
}) {
  const router = useRouter();

  const [date, setDate] = useState(record.date);
  const [title, setTitle] = useState(record.title);
  const [details, setDetails] = useState(record.details);
  const [source, setSource] = useState(record.source);
  const [remarks, setRemarks] = useState(record.remarks);
  const [priority, setPriority] = useState(record.priority);
  const [selectedAreaIds, setSelectedAreaIds] = useState<string[]>(
    record.selectedAreaIds
  );

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedAreaNames = useMemo(() => {
    return areas
      .filter((area) => selectedAreaIds.includes(area.id))
      .map((area) => area.name);
  }, [areas, selectedAreaIds]);

  function toggleArea(id: string) {
    if (selectedAreaIds.includes(id)) {
      setSelectedAreaIds(selectedAreaIds.filter((item) => item !== id));
    } else {
      setSelectedAreaIds([...selectedAreaIds, id]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`/api/information/${record.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date,
          title,
          details,
          source,
          remarks,
          priority,
          areaIds: selectedAreaIds,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update information.");
        return;
      }

      setSuccess("Information updated successfully.");

      setTimeout(() => {
        router.push("/information");
        router.refresh();
      }, 700);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteRecord() {
    const ok = window.confirm(
      `Delete "${record.title}"? This action cannot be undone.`
    );

    if (!ok) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/information/${record.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to delete information.");
        return;
      }

      router.push("/information");
      router.refresh();
    } catch {
      setError("Network error.");
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
              Information Shared
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Edit Shared Information
            </h2>

            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-blue-100">
              Update information shared to one or more regions or areas.
            </p>
          </div>
        </div>

        <SectionCard
          number="01"
          title="Information Details"
          subtitle="Update date, title, source and priority."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Date">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input"
              />
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
              <Field label="Information Title">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Short title"
                  className="input"
                />
              </Field>
            </div>

            <div className="md:col-span-2">
              <Field label="Received From / Source">
                <input
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="Example: public source, region officer, phone call..."
                  className="input"
                />
              </Field>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          number="02"
          title="Shared To"
          subtitle="Select one or more regions/areas where this information was shared."
        >
          {areas.length === 0 ? (
            <div className="rounded-2xl bg-amber-50 p-4 text-sm font-black text-amber-700">
              No active shared areas found.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {areas.map((area) => {
                const active = selectedAreaIds.includes(area.id);

                return (
                  <button
                    type="button"
                    key={area.id}
                    onClick={() => toggleArea(area.id)}
                    className={`rounded-2xl px-4 py-2 text-sm font-black transition ${
                      active
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    }`}
                  >
                    {active ? "✓ " : ""}
                    {area.name}
                  </button>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard
          number="03"
          title="Information"
          subtitle="Write the full information details."
        >
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={8}
            dir="auto"
            placeholder="Write information details..."
            className="input dhivehi-text resize-none text-lg leading-9"
          />
        </SectionCard>

        <SectionCard
          number="04"
          title="Remarks"
          subtitle="Optional remarks or follow-up notes."
        >
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={5}
            dir="auto"
            placeholder="Remarks..."
            className="input dhivehi-text resize-none text-lg leading-9"
          />
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
            {userRole === "MAIN_ADMIN" && (
              <button
                type="button"
                onClick={deleteRecord}
                disabled={loading}
                className="rounded-2xl bg-red-50 px-5 py-3 text-sm font-black text-red-700 hover:bg-red-100 disabled:opacity-60"
              >
                Delete
              </button>
            )}

            <button
              type="button"
              onClick={() => router.push("/information")}
              className="rounded-2xl bg-slate-200 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-300"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Update Information"}
            </button>
          </div>
        </div>
      </form>

      <aside className="space-y-4 xl:sticky xl:top-24 xl:h-fit">
        <div className="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-black text-slate-900">Summary</h3>

          <div className="mt-4 space-y-3">
            <Info label="Date" value={date || "-"} />
            <Info label="Priority" value={priority || "-"} />
            <Info label="Title" value={title || "-"} />
            <Info
              label="Shared To"
              value={selectedAreaNames.length ? selectedAreaNames.join(", ") : "-"}
            />
          </div>
        </div>

        <div className="rounded-[2rem] border border-blue-100 bg-blue-50 p-5 text-sm font-semibold leading-6 text-blue-900">
          This module is separate from Tasks. Use it only for information that
          was shared to a region or area.
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
      <p className="mt-1 break-words text-sm font-black text-slate-900 [overflow-wrap:anywhere]">
        {value}
      </p>
    </div>
  );
}