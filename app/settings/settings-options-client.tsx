"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type OptionItem = {
  id: string;
  name: string;
  isActive: boolean;
};

export default function SettingsOptionsClient({
  sharedToOptions,
  requestTypeOptions,
}: {
  sharedToOptions: OptionItem[];
  requestTypeOptions: OptionItem[];
}) {
  return (
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
    <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <p className="text-xs font-black uppercase tracking-wide text-blue-600">
          Dropdown
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

      {error && (
        <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-black text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">
          {success}
        </div>
      )}

      <div className="mt-5 space-y-2">
        {options.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
            No options added yet.
          </div>
        ) : (
          options.map((option) => (
            <div
              key={option.id}
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
                    ? "Available for new task records"
                    : "Hidden from new task forms"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-black ${
                    option.isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {option.isActive ? "Active" : "Disabled"}
                </span>

                <button
                  type="button"
                  onClick={() => updateStatus(option)}
                  disabled={updatingId === option.id}
                  className={`rounded-2xl px-4 py-2 text-xs font-black disabled:opacity-60 ${
                    option.isActive
                      ? "bg-red-50 text-red-700 hover:bg-red-100"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  {updatingId === option.id
                    ? "Updating..."
                    : option.isActive
                      ? "Disable"
                      : "Enable"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SmallStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
    </div>
  );
}