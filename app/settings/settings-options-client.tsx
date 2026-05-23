"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const REGIONS = ["SPR", "SCPR", "NCPR", "NPR", "UNPR"];

type OptionItem = {
  id: string;
  name: string;
  isActive: boolean;
};

type CrimeCategoryItem = {
  id: string;
  name: string;
  region: string;
  isActive: boolean;
};

export default function SettingsOptionsClient({
  sharedToOptions,
  requestTypeOptions,
  crimeCategories,
}: {
  sharedToOptions: OptionItem[];
  requestTypeOptions: OptionItem[];
  crimeCategories: CrimeCategoryItem[];
}) {
  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600 text-white shadow-xl shadow-blue-900/20">
        <div className="p-6 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-200">
            Admin Settings
          </p>

          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            Dropdown Management
          </h1>

          <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-blue-100">
            Manage task dropdowns and region-wise crime categories for the
            person database.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <OptionManager
          title="Information Shared To"
          subtitle="Options staff can select when information is shared."
          type="SHARED_TO"
          options={sharedToOptions}
          placeholder="Example: Investigation"
        />

        <OptionManager
          title="Request Type"
          subtitle="Options staff can select for request/category type."
          type="REQUEST_TYPE"
          options={requestTypeOptions}
          placeholder="Example: Theft"
        />
      </div>

      <CrimeCategoryManager options={crimeCategories} />
    </div>
  );
}

function OptionManager({
  title,
  subtitle,
  type,
  options,
  placeholder,
}: {
  title: string;
  subtitle: string;
  type: "SHARED_TO" | "REQUEST_TYPE";
  options: OptionItem[];
  placeholder: string;
}) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState("");

  async function addOption(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/settings/options", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          name,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to add option.");
        return;
      }

      setName("");
      setSuccess("Option added successfully.");
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(option: OptionItem) {
    const nextStatus = !option.isActive;

    const confirmText = nextStatus
      ? `Enable "${option.name}" again?`
      : `Disable "${option.name}"? It will not show in new task forms, but old task records will keep it.`;

    const ok = window.confirm(confirmText);

    if (!ok) return;

    setError("");
    setSuccess("");
    setUpdatingId(option.id);

    try {
      const res = await fetch("/api/settings/options", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          id: option.id,
          isActive: nextStatus,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update option.");
        return;
      }

      setSuccess(nextStatus ? "Option enabled." : "Option disabled.");
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setUpdatingId("");
    }
  }

  const activeCount = options.filter((item) => item.isActive).length;
  const disabledCount = options.filter((item) => !item.isActive).length;

  return (
    <div className="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <p className="text-xs font-black uppercase tracking-wide text-blue-600">
          Task Dropdown
        </p>

        <h2 className="mt-2 text-2xl font-black text-slate-900">{title}</h2>

        <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
          {subtitle}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <SmallStat label="Active" value={activeCount} />
        <SmallStat label="Disabled" value={disabledCount} />
      </div>

      <form
        onSubmit={addOption}
        className="mt-5 flex flex-col gap-3 sm:flex-row"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={placeholder}
          className="input flex-1"
        />

        <button
          disabled={loading}
          className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Adding..." : "Add"}
        </button>
      </form>

      {error && <Alert type="error" text={error} />}
      {success && <Alert type="success" text={success} />}

      <div className="mt-5 space-y-2">
        {options.length === 0 ? (
          <EmptyBox text="No options added yet." />
        ) : (
          options.map((option) => (
            <OptionRow
              key={option.id}
              option={option}
              updatingId={updatingId}
              onUpdate={() => updateStatus(option)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function CrimeCategoryManager({
  options,
}: {
  options: CrimeCategoryItem[];
}) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [region, setRegion] = useState("NPR");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState("");

  const filteredOptions = useMemo(() => {
    return options.filter((item) => item.region === region);
  }, [options, region]);

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/settings/options", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "CRIME_CATEGORY",
          name,
          region,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to add crime category.");
        return;
      }

      setName("");
      setSuccess("Crime category added successfully.");
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(option: CrimeCategoryItem) {
    const nextStatus = !option.isActive;

    const confirmText = nextStatus
      ? `Enable "${option.name}" for ${option.region}?`
      : `Disable "${option.name}" for ${option.region}? It will not show in new person forms, but old records will keep it.`;

    const ok = window.confirm(confirmText);

    if (!ok) return;

    setError("");
    setSuccess("");
    setUpdatingId(option.id);

    try {
      const res = await fetch("/api/settings/options", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "CRIME_CATEGORY",
          id: option.id,
          isActive: nextStatus,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update crime category.");
        return;
      }

      setSuccess(nextStatus ? "Category enabled." : "Category disabled.");
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setUpdatingId("");
    }
  }

  const activeCount = filteredOptions.filter((item) => item.isActive).length;
  const disabledCount = filteredOptions.filter((item) => !item.isActive).length;

  return (
    <div className="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-blue-600">
            Person Database
          </p>

          <h2 className="mt-2 text-2xl font-black text-slate-900">
            Region Crime Categories
          </h2>

          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
            Each region can have different crime categories. Staff will only
            see active categories from their own region.
          </p>
        </div>

        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="input lg:w-44"
        >
          {REGIONS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <SmallStat label="Selected Region" value={region} />
        <SmallStat label="Active" value={activeCount} />
        <SmallStat label="Disabled" value={disabledCount} />
      </div>

      <form
        onSubmit={addCategory}
        className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-[170px_1fr_auto]"
      >
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="input"
        >
          {REGIONS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Example: Drug Network"
          className="input"
        />

        <button
          disabled={loading}
          className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Adding..." : "Add Category"}
        </button>
      </form>

      {error && <Alert type="error" text={error} />}
      {success && <Alert type="success" text={success} />}

      <div className="mt-5 grid grid-cols-1 gap-2 lg:grid-cols-2">
        {filteredOptions.length === 0 ? (
          <div className="lg:col-span-2">
            <EmptyBox text="No categories added for this region." />
          </div>
        ) : (
          filteredOptions.map((option) => (
            <CrimeCategoryRow
              key={option.id}
              option={option}
              updatingId={updatingId}
              onUpdate={() => updateStatus(option)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function OptionRow({
  option,
  updatingId,
  onUpdate,
}: {
  option: OptionItem;
  updatingId: string;
  onUpdate: () => void;
}) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
        option.isActive ? "bg-slate-50" : "bg-red-50/60"
      }`}
    >
      <div>
        <p
          className={`font-black ${
            option.isActive ? "text-slate-800" : "text-slate-500"
          }`}
        >
          {option.name}
        </p>

        <p className="mt-1 text-xs font-bold text-slate-400">
          {option.isActive
            ? "Available for new records"
            : "Hidden from new forms"}
        </p>
      </div>

      <StatusActionButton
        active={option.isActive}
        loading={updatingId === option.id}
        onClick={onUpdate}
      />
    </div>
  );
}

function CrimeCategoryRow({
  option,
  updatingId,
  onUpdate,
}: {
  option: CrimeCategoryItem;
  updatingId: string;
  onUpdate: () => void;
}) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
        option.isActive ? "bg-blue-50/70" : "bg-red-50/60"
      }`}
    >
      <div>
        <p
          className={`font-black ${
            option.isActive ? "text-slate-800" : "text-slate-500"
          }`}
        >
          {option.name}
        </p>

        <p className="mt-1 text-xs font-bold text-slate-400">
          {option.region} •{" "}
          {option.isActive ? "Available for person records" : "Hidden"}
        </p>
      </div>

      <StatusActionButton
        active={option.isActive}
        loading={updatingId === option.id}
        onClick={onUpdate}
      />
    </div>
  );
}

function StatusActionButton({
  active,
  loading,
  onClick,
}: {
  active: boolean;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`rounded-full px-3 py-1 text-xs font-black ${
          active
            ? "bg-emerald-50 text-emerald-700"
            : "bg-slate-200 text-slate-500"
        }`}
      >
        {active ? "Active" : "Disabled"}
      </span>

      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className={`rounded-2xl px-4 py-2 text-xs font-black disabled:opacity-60 ${
          active
            ? "bg-red-50 text-red-700 hover:bg-red-100"
            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
        }`}
      >
        {loading ? "Updating..." : active ? "Disable" : "Enable"}
      </button>
    </div>
  );
}

function SmallStat({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl bg-blue-50/70 p-4">
      <p className="text-[11px] font-black uppercase tracking-wide text-blue-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function Alert({ type, text }: { type: "error" | "success"; text: string }) {
  return (
    <div
      className={`mt-4 rounded-2xl px-4 py-3 text-sm font-black ${
        type === "error"
          ? "bg-red-50 text-red-700"
          : "bg-emerald-50 text-emerald-700"
      }`}
    >
      {text}
    </div>
  );
}

function EmptyBox({ text }: { text: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
      {text}
    </div>
  );
}