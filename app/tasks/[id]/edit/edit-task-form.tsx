"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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

type EditTaskData = {
  id: string;
  taskNumber: string;
  date: string;
  region: string;
  atoll: string;
  island: string;
  description: string;
  informationProvided: string;
  informationProvidedDate: string;
  status: string;
  selectedSharedToIds: string[];
  selectedRequestTypeIds: string[];
};

export default function EditTaskForm({
  task,
  userRole,
  userRegion,
  sharedToOptions,
  requestTypeOptions,
}: {
  task: EditTaskData;
  userRole: "MAIN_ADMIN" | "STAFF";
  userRegion: string | null;
  sharedToOptions: OptionItem[];
  requestTypeOptions: OptionItem[];
}) {
  const router = useRouter();

  const [date, setDate] = useState(task.date);
  const [region, setRegion] = useState(task.region);
  const [atoll, setAtoll] = useState(task.atoll);
  const [island, setIsland] = useState(task.island);
  const [description, setDescription] = useState(task.description);
  const [informationProvided, setInformationProvided] = useState(
    task.informationProvided
  );
  const [informationProvidedDate, setInformationProvidedDate] = useState(
    task.informationProvidedDate
  );
  const [status, setStatus] = useState(task.status);

  const [selectedSharedTo, setSelectedSharedTo] = useState<string[]>(
    task.selectedSharedToIds
  );
  const [selectedRequestTypes, setSelectedRequestTypes] = useState<string[]>(
    task.selectedRequestTypeIds
  );

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
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
        setError(data.error || "Failed to update task.");
        return;
      }

      setSuccess("Task updated successfully.");

      setTimeout(() => {
        router.push("/tasks");
        router.refresh();
      }, 700);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
    >
      <div className="mb-6">
        <p className="text-xs font-black uppercase tracking-wide text-blue-600">
          {task.taskNumber}
        </p>

        <h2 className="mt-1 text-2xl font-black text-slate-900">
          Edit Task Record
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          Update task details, information shared, request types and status.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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

      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
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

      <div className="mt-5 space-y-5">
        <Field label="Task Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            dir="auto"
            placeholder="ޓާސްކް ތަފްޞީލް..."
            className="input dhivehi-text resize-none text-lg"
          />
        </Field>

        <Field label="Information Provided (Optional)">
          <textarea
            value={informationProvided}
            onChange={(e) => setInformationProvided(e.target.value)}
            rows={5}
            dir="auto"
            placeholder="މަޢުލޫމާތު..."
            className="input dhivehi-text resize-none text-lg"
          />
        </Field>
      </div>

      {error && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          {success}
        </div>
      )}

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.push("/tasks")}
          className="rounded-2xl bg-slate-200 px-5 py-3 text-sm font-black text-slate-700"
        >
          Cancel
        </button>

        <button
          disabled={loading}
          className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Updating..." : "Update Task"}
        </button>
      </div>
    </form>
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