"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const REGIONS = ["SPR", "SCPR", "NCPR", "NPR", "UNPR"];

const ATOLLS = [
  "HA",
  "HDh",
  "Sh",
  "N",
  "R",
  "B",
  "Lh",
  "K",
  "AA",
  "ADh",
  "V",
  "M",
  "F",
  "Dh",
  "Th",
  "L",
  "GA",
  "GDh",
  "Gn",
  "S",
];

const STATUS = [
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CLOSED", label: "Closed" },
];

type OptionItem = {
  id: string;
  name: string;
};

export default function AddTaskForm({
  userRole,
  userRegion,
  userName,
  serviceNumber,
  sharedToOptions,
  requestTypeOptions,
}: {
  userRole: "MAIN_ADMIN" | "STAFF";
  userRegion: string | null;
  userName: string;
  serviceNumber: string;
  sharedToOptions: OptionItem[];
  requestTypeOptions: OptionItem[];
}) {
  const router = useRouter();

  const today = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(today);
  const [region, setRegion] = useState(userRegion || "NPR");
  const [atoll, setAtoll] = useState("R");
  const [island, setIsland] = useState("");
  const [description, setDescription] = useState("");
  const [informationProvided, setInformationProvided] = useState("");
  const [informationProvidedDate, setInformationProvidedDate] = useState("");
  const [status, setStatus] = useState("PENDING");

  const [selectedSharedTo, setSelectedSharedTo] = useState<string[]>([]);
  const [selectedRequestTypes, setSelectedRequestTypes] = useState<string[]>([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [taskNumber, setTaskNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedSharedNames = useMemo(
    () =>
      sharedToOptions
        .filter((item) => selectedSharedTo.includes(item.id))
        .map((item) => item.name),
    [sharedToOptions, selectedSharedTo]
  );

  const selectedRequestNames = useMemo(
    () =>
      requestTypeOptions
        .filter((item) => selectedRequestTypes.includes(item.id))
        .map((item) => item.name),
    [requestTypeOptions, selectedRequestTypes]
  );

  function toggleValue(
    value: string,
    list: string[],
    setter: (value: string[]) => void
  ) {
    if (list.includes(value)) {
      setter(list.filter((item) => item !== value));
    } else {
      setter([...list, value]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setTaskNumber("");
    setLoading(true);

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date,
          region,
          atoll,
          island,
          description,
          informationProvided,
          informationProvidedDate,
          status,
          sharedToOptionIds: selectedSharedTo,
          requestTypeOptionIds: selectedRequestTypes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save task.");
        return;
      }

      setSuccess("Task update saved successfully.");
      setTaskNumber(data.task.taskNumber);

      setIsland("");
      setDescription("");
      setInformationProvided("");
      setInformationProvidedDate("");
      setStatus("PENDING");
      setSelectedSharedTo([]);
      setSelectedRequestTypes([]);

      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Hero */}
        <div className="overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-xl shadow-slate-900/10">
          <div className="relative p-6 sm:p-8">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-blue-500/20 blur-2xl" />
            <div className="absolute bottom-0 left-10 h-24 w-24 rounded-full bg-cyan-400/10 blur-2xl" />

            <div className="relative">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-300">
                New Record
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Add Task Update
              </h2>

              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-300 sm:text-base">
                Record task details, request type, shared section, and
                information updates in one place.
              </p>
            </div>
          </div>
        </div>

        {/* Basic details */}
        <SectionCard
          number="01"
          title="Basic Details"
          subtitle="Select region, date, atoll, island and current status."
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

            <Field label="Region">
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                disabled={userRole !== "MAIN_ADMIN"}
                className="input disabled:bg-slate-100"
              >
                {REGIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Atoll">
              <select
                value={atoll}
                onChange={(e) => setAtoll(e.target.value)}
                className="input"
              >
                {ATOLLS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Island">
              <input
                value={island}
                onChange={(e) => setIsland(e.target.value)}
                placeholder="Island name"
                className="input"
              />
            </Field>

            <Field label="Status">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="input"
              >
                {STATUS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Information Provided Date">
              <input
                type="date"
                value={informationProvidedDate}
                onChange={(e) => setInformationProvidedDate(e.target.value)}
                className="input"
              />
            </Field>
          </div>
        </SectionCard>

        {/* Classifications */}
        <SectionCard
          number="02"
          title="Classification"
          subtitle="Choose one or more shared sections and request types."
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <MultiSelectBox
              title="Information Shared To"
              description="Select one or more"
              options={sharedToOptions}
              selected={selectedSharedTo}
              onToggle={(id) =>
                toggleValue(id, selectedSharedTo, setSelectedSharedTo)
              }
            />

            <MultiSelectBox
              title="Request Type"
              description="Select one or more"
              options={requestTypeOptions}
              selected={selectedRequestTypes}
              onToggle={(id) =>
                toggleValue(id, selectedRequestTypes, setSelectedRequestTypes)
              }
            />
          </div>
        </SectionCard>

        {/* Dhivehi details */}
        <SectionCard
          number="03"
          title="Task Information"
          subtitle="Task description is required. Information Provided can be updated later."
        >
          <div className="space-y-4">
            <Field label="Task Description">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                dir="auto"
                placeholder="ޓާސްކް ތަފްޞީލް..."
                className="input dhivehi-text resize-none text-lg leading-9"
              />
            </Field>

            <Field label="Information Provided (Optional)">
              <textarea
                value={informationProvided}
                onChange={(e) => setInformationProvided(e.target.value)}
                rows={6}
                dir="auto"
                placeholder="މަޢުލޫމާތު ދެވިފައި ނެތްނަމަ ހުސްކޮށް ބަހައްޓާ..."
                className="input dhivehi-text resize-none text-lg leading-9"
              />
            </Field>
          </div>
        </SectionCard>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">
            {success}
            {taskNumber && (
              <span className="mt-1 block text-emerald-900">
                Task No: {taskNumber}
              </span>
            )}
          </div>
        )}

        {/* Mobile sticky submit */}
        <div className="sticky bottom-20 z-20 rounded-[1.5rem] border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="rounded-2xl bg-slate-200 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-300"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save Task Update"}
            </button>
          </div>
        </div>
      </form>

      {/* Summary */}
      <aside className="space-y-4 xl:sticky xl:top-24 xl:h-fit">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-black text-slate-900">Record Owner</h3>

          <div className="mt-4 space-y-3">
            <Info label="Created By" value={userName} />
            <Info label="Service Number" value={serviceNumber} />
            <Info
              label="Access Region"
              value={
                userRole === "MAIN_ADMIN" ? "All Regions" : userRegion || "-"
              }
            />
          </div>
        </div>

        <div className="rounded-[2rem] border border-blue-100 bg-blue-50 p-5">
          <p className="text-sm font-black text-blue-900">Selected Summary</p>

          <div className="mt-4 space-y-3">
            <SummaryRow label="Date" value={date || "-"} />
            <SummaryRow label="Region" value={region || "-"} />
            <SummaryRow label="Atoll" value={atoll || "-"} />
            <SummaryRow label="Island" value={island || "-"} />
            <SummaryRow
              label="Shared To"
              value={
                selectedSharedNames.length ? selectedSharedNames.join(", ") : "-"
              }
            />
            <SummaryRow
              label="Request Type"
              value={
                selectedRequestNames.length
                  ? selectedRequestNames.join(", ")
                  : "-"
              }
            />
          </div>
        </div>

        <div className="rounded-[2rem] border border-amber-100 bg-amber-50 p-5 text-sm font-semibold leading-6 text-amber-900">
          Information Provided, Information Provided Date, Shared To, and
          Request Type can be updated later if needed.
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
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
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

function MultiSelectBox({
  title,
  description,
  options,
  selected,
  onToggle,
}: {
  title: string;
  description: string;
  options: OptionItem[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3">
        <p className="text-sm font-black text-slate-800">{title}</p>
        <p className="text-xs font-bold text-slate-400">{description}</p>
      </div>

      {options.length === 0 ? (
        <p className="rounded-2xl bg-white p-3 text-sm font-bold text-slate-500">
          No options added yet.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const active = selected.includes(option.id);

            return (
              <button
                type="button"
                key={option.id}
                onClick={() => onToggle(option.id)}
                className={`rounded-2xl px-4 py-2 text-sm font-black transition ${
                  active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                {active ? "✓ " : ""}
                {option.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-black text-slate-900">
        {value}
      </p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/70 p-3">
      <p className="text-[11px] font-black uppercase tracking-wide text-blue-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-black text-slate-900">
        {value}
      </p>
    </div>
  );
}