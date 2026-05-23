"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const REGIONS = ["ALL", "SPR", "SCPR", "NCPR", "NPR", "UNPR"];

const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

type ExportType = "tasks" | "yaumiyya";

export default function ExportClient({
  defaultMonth,
  defaultYear,
}: {
  defaultMonth: string;
  defaultYear: string;
}) {
  const [exportType, setExportType] = useState<ExportType>("tasks");
  const [month, setMonth] = useState(defaultMonth);
  const [year, setYear] = useState(defaultYear);
  const [region, setRegion] = useState("ALL");

  const years = useMemo(() => {
    const current = Number(defaultYear);
    return Array.from({ length: 6 }, (_, index) => String(current - index));
  }, [defaultYear]);

  const selectedMonthLabel =
    MONTHS.find((item) => item.value === month)?.label || month;

  const downloadUrl = useMemo(() => {
    const params = new URLSearchParams();

    params.set("month", month);
    params.set("year", year);
    params.set("region", region);

    if (exportType === "tasks") {
      return `/api/reports/export/tasks?${params.toString()}`;
    }

    return `/api/reports/export/yaumiyya?${params.toString()}`;
  }, [exportType, month, year, region]);

  const fileName =
    exportType === "tasks"
      ? `Task_Report_${region}_${year}_${month}.docx`
      : `Yaumiyya_Report_${region}_${year}_${month}.docx`;

  return (
    <div className="pb-24 lg:pb-8">
      <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600 text-white shadow-xl shadow-blue-900/20">
        <div className="relative p-6 sm:p-8">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-400/20 blur-2xl" />
          <div className="absolute bottom-0 left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-100">
                Phase 4
              </p>

              <h1 className="mt-3 text-3xl font-black sm:text-4xl">
                Monthly Word Export
              </h1>

              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-blue-100">
                Generate clean monthly Word files for Tasks and Yaumiyya. Main
                Admin only.
              </p>
            </div>

            <Link
              href="/reports"
              className="rounded-2xl bg-white/10 px-5 py-3 text-center text-sm font-black text-white ring-1 ring-white/20 hover:bg-white/20"
            >
              Back to Reports
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ExportTypeCard
          active={exportType === "tasks"}
          title="Tasks Word File"
          subtitle="Monthly task records with status, region, island, shared-to and information provided."
          icon="📄"
          onClick={() => setExportType("tasks")}
        />

        <ExportTypeCard
          active={exportType === "yaumiyya"}
          title="Yaumiyya Word File"
          subtitle="Monthly Yaumiyya records with participants, meeting notes and assigned tasks."
          icon="📝"
          onClick={() => setExportType("yaumiyya")}
        />

        <div className="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wide text-blue-600">
            Selected Export
          </p>

          <h2 className="mt-2 text-2xl font-black text-slate-900">
            {exportType === "tasks" ? "Tasks Report" : "Yaumiyya Report"}
          </h2>

          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
            {selectedMonthLabel} {year} •{" "}
            {region === "ALL" ? "All Regions" : region}
          </p>

          <p className="mt-3 break-words rounded-2xl bg-slate-50 px-4 py-3 text-xs font-black text-slate-500">
            {fileName}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-[2rem] border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Month">
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="input w-full"
            >
              {MONTHS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Year">
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="input w-full"
            >
              {years.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Region">
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="input w-full"
            >
              {REGIONS.map((item) => (
                <option key={item} value={item}>
                  {item === "ALL" ? "All Regions" : item}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-5 rounded-[1.5rem] bg-blue-50 p-5">
          <p className="text-sm font-black text-slate-900">Export Preview</p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <PreviewBox
              label="File Type"
              value={exportType === "tasks" ? "Tasks Word" : "Yaumiyya Word"}
            />
            <PreviewBox label="Month" value={`${selectedMonthLabel} ${year}`} />
            <PreviewBox
              label="Region"
              value={region === "ALL" ? "All Regions" : region}
            />
          </div>

          <p className="mt-4 text-xs font-bold leading-5 text-slate-500">
            Click Generate Word File to download the selected monthly report.
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Link
            href="/reports"
            className="rounded-2xl bg-slate-200 px-5 py-3 text-center text-sm font-black text-slate-700 hover:bg-slate-300"
          >
            Cancel
          </Link>

          <a
            href={downloadUrl}
            className="rounded-2xl bg-blue-700 px-5 py-3 text-center text-sm font-black text-white hover:bg-blue-800"
          >
            Generate Word File
          </a>
        </div>
      </div>

      <div className="mt-5 rounded-[2rem] border border-blue-100 bg-white p-5 shadow-sm">
        <p className="text-sm font-black text-slate-900">Admin Only Export</p>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
          This page and its export APIs are protected for Main Admin only. Staff
          users are redirected away and cannot generate files.
        </p>
      </div>
    </div>
  );
}

function ExportTypeCard({
  active,
  title,
  subtitle,
  icon,
  onClick,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[2rem] border p-5 text-left shadow-sm transition ${
        active
          ? "border-blue-300 bg-blue-50 ring-2 ring-blue-200"
          : "border-blue-100 bg-white hover:bg-blue-50"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-700 text-xl text-white">
          {icon}
        </div>

        <div>
          <p className="text-lg font-black text-slate-900">{title}</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
            {subtitle}
          </p>
        </div>
      </div>
    </button>
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

function PreviewBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-slate-900">{value}</p>
    </div>
  );
}