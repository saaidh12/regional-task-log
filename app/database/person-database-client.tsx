"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

const REGIONS = ["ALL", "SPR", "SCPR", "NCPR", "NPR", "UNPR"];

type SimpleItem = {
  id: string;
  name: string;
};

export type CrimeCategoryFilterItem = {
  id: string;
  name: string;
  region: string;
  isActive: boolean;
};

export type PersonItem = {
  id: string;
  photoUrl: string;
  fullName: string;
  idNumber: string;
  address: string;
  mobileNumber: string;
  region: string;
  atoll: string;
  island: string;
  notes: string;
  createdByName: string;
  createdByServiceNumber: string;
  createdAt: string;
  updatedAt: string;
  nicknames: SimpleItem[];
  crimeCategories: {
    id: string;
    name: string;
    region: string;
  }[];
};

export default function PersonDatabaseClient({
  people,
  crimeCategories,
  session,
  filters,
  pagination,
}: {
  people: PersonItem[];
  crimeCategories: CrimeCategoryFilterItem[];
  session: {
    role: "MAIN_ADMIN" | "STAFF";
    region: string | null;
  };
  filters: {
    q: string;
    region: string;
    island: string;
    category: string;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalPeople: number;
    pageSize: number;
  };
}) {
  const [selectedPerson, setSelectedPerson] = useState<PersonItem | null>(null);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const start = Math.max(1, pagination.currentPage - 3);
    const end = Math.min(pagination.totalPages, pagination.currentPage + 4);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }, [pagination.currentPage, pagination.totalPages]);

  const visibleCategories = crimeCategories.filter((category) => {
    if (filters.region !== "ALL") {
      return category.region === filters.region;
    }

    if (session.role !== "MAIN_ADMIN" && session.region) {
      return category.region === session.region;
    }

    return true;
  });

  return (
    <div className="pb-24 lg:pb-8">
      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-sky-950 via-blue-800 to-cyan-600 text-white shadow-xl shadow-blue-900/20">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-100">
                  Person Database
                </p>

                <h1 className="mt-3 text-3xl font-black sm:text-4xl">
                  Regional Database
                </h1>

                <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-blue-100">
                  Search and manage person records by region, island, nickname,
                  ID number, mobile number and crime category.
                </p>
              </div>

              <Link
                href="/database/new"
                className="rounded-2xl bg-white px-5 py-3 text-center text-sm font-black text-blue-700 shadow-lg shadow-blue-950/20 hover:bg-blue-50"
              >
                + Add Person
              </Link>
            </div>
          </div>
        </div>

        <details className="group mt-5 rounded-[2rem] border border-blue-100 bg-white p-3 shadow-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-[1.5rem] bg-blue-50 px-4 py-4">
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-900">Filters</p>
              <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
                Search name, ID, mobile, island, region and crime category
              </p>
            </div>

            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-sm font-black text-white transition group-open:rotate-180">
              ↓
            </span>
          </summary>

          <div className="mt-3">
            <form className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_150px_150px_180px_auto]">
              <Field label="Search">
                <input
                  name="q"
                  defaultValue={filters.q}
                  placeholder="Name, nickname, ID, mobile, address..."
                  className="input w-full"
                />
              </Field>

              <Field label="Region">
                {session.role === "MAIN_ADMIN" ? (
                  <select
                    name="region"
                    defaultValue={filters.region}
                    className="input w-full"
                  >
                    {REGIONS.map((item) => (
                      <option key={item} value={item}>
                        {item === "ALL" ? "All Regions" : item}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    name="region"
                    value={session.region || ""}
                    readOnly
                    className="input w-full bg-slate-100"
                  />
                )}
              </Field>

              <Field label="Island">
                <input
                  name="island"
                  defaultValue={filters.island}
                  placeholder="Island"
                  className="input w-full"
                />
              </Field>

              <Field label="Crime Category">
                <select
                  name="category"
                  defaultValue={filters.category}
                  className="input w-full"
                >
                  <option value="ALL">All Categories</option>
                  {visibleCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.region} - {category.name}
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

            <div className="mt-3 flex flex-col gap-3 text-xs font-bold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <p>
                Showing page {pagination.currentPage} of{" "}
                {pagination.totalPages} • {pagination.totalPeople} total records
              </p>

              <Link href="/database" className="text-blue-600">
                Clear Filters
              </Link>
            </div>
          </div>
        </details>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {people.length === 0 ? (
            <div className="rounded-[2rem] border border-blue-100 bg-white p-8 text-center shadow-sm md:col-span-2 xl:col-span-3">
              <p className="text-lg font-black text-slate-900">
                No person records found.
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                Add a person record or change your filters.
              </p>
            </div>
          ) : (
            people.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                onView={() => setSelectedPerson(person)}
              />
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

          {pageNumbers[0] > 1 && (
            <>
              <PageButton page={1} label="1" filters={filters} />
              <span className="px-2 text-slate-400">...</span>
            </>
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

          {pageNumbers[pageNumbers.length - 1] < pagination.totalPages && (
            <>
              <span className="px-2 text-slate-400">...</span>
              <PageButton
                page={pagination.totalPages}
                label={String(pagination.totalPages)}
                filters={filters}
              />
            </>
          )}

          {pagination.currentPage < pagination.totalPages && (
            <PageButton
              page={pagination.currentPage + 1}
              label="Next"
              filters={filters}
            />
          )}
        </div>
      </section>

      {selectedPerson && (
        <PersonModal
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
        />
      )}
    </div>
  );
}

function PersonCard({
  person,
  onView,
}: {
  person: PersonItem;
  onView: () => void;
}) {
  const nicknames = person.nicknames.map((item) => item.name).join(", ");

  return (
    <div className="overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-950/10">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <PersonPhoto person={person} size="card" />

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-black text-slate-900">
              {person.fullName}
            </h2>

            <p className="mt-1 text-xs font-bold text-slate-500">
              {person.region}
              {person.atoll ? ` • ${person.atoll}` : ""}
              {person.island ? ` • ${person.island}` : ""}
            </p>

            {nicknames && (
              <p className="mt-2 line-clamp-1 text-sm font-bold text-blue-700">
                AKA: {nicknames}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <MiniInfo label="ID" value={person.idNumber || "-"} />
          <MiniInfo label="Mobile" value={person.mobileNumber || "-"} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {person.crimeCategories.length === 0 ? (
            <span className="rounded-2xl bg-slate-50 px-3 py-1 text-xs font-black text-slate-500">
              No category
            </span>
          ) : (
            person.crimeCategories.slice(0, 3).map((category) => (
              <span
                key={category.id}
                className="rounded-2xl bg-blue-50 px-3 py-1 text-xs font-black text-blue-700"
              >
                {category.name}
              </span>
            ))
          )}

          {person.crimeCategories.length > 3 && (
            <span className="rounded-2xl bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
              +{person.crimeCategories.length - 3}
            </span>
          )}
        </div>

        <button
          onClick={onView}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-700 px-4 py-3 text-sm font-black text-white hover:bg-blue-800"
        >
          <span>👁</span>
          View Record
        </button>
      </div>
    </div>
  );
}

function PersonModal({
  person,
  onClose,
}: {
  person: PersonItem;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState("");

  const nicknames = person.nicknames.map((item) => item.name).join(", ");
  const categories = person.crimeCategories.map((item) => item.name).join(", ");

  const recordText = buildPersonRecordText(person);

  async function copyText(label: string, text: string) {
    try {
      await navigator.clipboard.writeText(text || "-");
      setCopied(label);

      setTimeout(() => {
        setCopied("");
      }, 1800);
    } catch {
      alert("Unable to copy. Please try again.");
    }
  }

  async function shareRecord() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: person.fullName,
          text: recordText,
        });
        return;
      }

      await copyText("Full record copied", recordText);
    } catch {
      // User cancelled share; no need to show error.
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[2rem] bg-white shadow-2xl sm:max-h-[88vh] sm:rounded-[2rem]">
        <div className="shrink-0 border-b border-blue-100 bg-white px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <PersonPhoto person={person} size="modal" />

              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-wide text-blue-600">
                  Person Record
                </p>

                <h2 className="mt-1 break-words text-2xl font-black text-slate-900">
                  {person.fullName}
                </h2>

                <p className="mt-1 text-sm font-bold text-slate-500">
                  {person.region}
                  {person.atoll ? ` • ${person.atoll}` : ""}
                  {person.island ? ` • ${person.island}` : ""}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-xl font-black text-slate-700 hover:bg-slate-200"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-5">
          <div className="overflow-hidden rounded-[2rem] border border-blue-100 bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600 text-white shadow-xl shadow-blue-900/10">
            <div className="p-5 sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <PersonPhoto person={person} size="share" />

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-100">
                    Regional Database Card
                  </p>

                  <h3 className="mt-2 break-words text-3xl font-black">
                    {person.fullName}
                  </h3>

                  {nicknames && (
                    <p className="mt-2 break-words text-sm font-bold text-blue-100">
                      AKA: {nicknames}
                    </p>
                  )}

                  <p className="mt-3 text-sm font-bold text-blue-100">
                    {person.region}
                    {person.atoll ? ` • ${person.atoll}` : ""}
                    {person.island ? ` • ${person.island}` : ""}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <CardInfo label="ID Number" value={person.idNumber || "-"} />
                <CardInfo label="Mobile" value={person.mobileNumber || "-"} />
                <CardInfo label="Categories" value={categories || "-"} />
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Info label="Region" value={person.region} />
            <Info label="Atoll" value={person.atoll || "-"} />
            <Info label="Island" value={person.island || "-"} />
            <Info label="ID Number" value={person.idNumber || "-"} />
            <Info label="Mobile" value={person.mobileNumber || "-"} />
            <Info label="Address" value={person.address || "-"} />
            <Info label="Created By" value={person.createdByName} />
            <Info label="Service No" value={person.createdByServiceNumber} />
          </div>

          <div className="mt-4 rounded-[1.5rem] border border-blue-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
              Copy / Share
            </p>

            {copied && (
              <p className="mt-2 rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700">
                {copied}
              </p>
            )}

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <ActionButton
                label="Copy Full"
                onClick={() => copyText("Full record copied", recordText)}
              />
              <ActionButton label="Share Card" onClick={shareRecord} />
              <ActionButton
                label="Copy ID"
                onClick={() =>
                  copyText("ID number copied", person.idNumber || "-")
                }
              />
              <ActionButton
                label="Copy Mobile"
                onClick={() =>
                  copyText("Mobile number copied", person.mobileNumber || "-")
                }
              />
              <ActionButton
                label="Copy Address"
                onClick={() =>
                  copyText("Address copied", person.address || "-")
                }
              />
            </div>
          </div>

          <TagSection
            title="Nicknames"
            items={person.nicknames}
            emptyText="No nicknames added."
          />

          <TagSection
            title="Crime Categories"
            items={person.crimeCategories}
            emptyText="No crime categories selected."
          />

          <div className="mt-4 rounded-[1.5rem] bg-blue-50 p-5">
            <p className="text-xs font-black uppercase tracking-wide text-blue-500">
              Notes
            </p>

            <p className="dhivehi-text mt-3 whitespace-pre-wrap break-words text-base leading-8 text-slate-900 [overflow-wrap:anywhere]">
              {person.notes?.trim() ? person.notes : "No notes added."}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Info label="Created At" value={formatDateTime(person.createdAt)} />
            <Info label="Updated At" value={formatDateTime(person.updatedAt)} />
          </div>
        </div>

        <div className="shrink-0 border-t border-blue-100 bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              onClick={onClose}
              className="rounded-2xl bg-slate-200 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-300"
            >
              Close
            </button>

            <Link
              href={`/database/${person.id}/edit`}
              className="rounded-2xl bg-blue-700 px-5 py-3 text-center text-sm font-black text-white hover:bg-blue-800"
            >
              Edit Record
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function buildPersonRecordText(person: PersonItem) {
  const nicknames = person.nicknames.map((item) => item.name).join(", ");
  const categories = person.crimeCategories.map((item) => item.name).join(", ");

  return [
    "REGIONAL DATABASE RECORD",
    "",
    `Name: ${person.fullName || "-"}`,
    `Nicknames: ${nicknames || "-"}`,
    `ID Number: ${person.idNumber || "-"}`,
    `Mobile: ${person.mobileNumber || "-"}`,
    `Region: ${person.region || "-"}`,
    `Atoll: ${person.atoll || "-"}`,
    `Island: ${person.island || "-"}`,
    `Address: ${person.address || "-"}`,
    `Crime Categories: ${categories || "-"}`,
    `Notes: ${person.notes || "-"}`,
    "",
    `Created By: ${person.createdByName || "-"} (${
      person.createdByServiceNumber || "-"
    })`,
    `Created At: ${formatDateTime(person.createdAt)}`,
    `Updated At: ${formatDateTime(person.updatedAt)}`,
  ].join("\n");
}

function ActionButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-black text-blue-700 hover:bg-blue-100"
    >
      {label}
    </button>
  );
}

function CardInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
      <p className="text-[10px] font-black uppercase tracking-wide text-blue-100">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-black text-white [overflow-wrap:anywhere]">
        {value}
      </p>
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

function TagSection({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: SimpleItem[];
  emptyText: string;
}) {
  return (
    <div className="mt-4 rounded-[1.5rem] bg-slate-50 p-5">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
        {title}
      </p>

      {items.length === 0 ? (
        <p className="mt-3 text-sm font-bold text-slate-500">{emptyText}</p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item.id}
              className="rounded-2xl bg-white px-4 py-2 text-sm font-black text-slate-700"
            >
              {item.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function PersonPhoto({
  person,
  size,
}: {
  person: PersonItem;
  size: "card" | "modal" | "share";
}) {
  const className =
    size === "share"
      ? "h-28 w-28 rounded-[2rem]"
      : size === "modal"
        ? "h-20 w-20 rounded-[1.5rem]"
        : "h-16 w-16 rounded-2xl";

  if (person.photoUrl) {
    return (
      <div
        className={`${className} relative shrink-0 overflow-hidden bg-blue-50 ring-4 ring-white/20`}
      >
        <Image
          src={person.photoUrl}
          alt={person.fullName}
          fill
          className="object-cover"
          sizes={size === "share" ? "112px" : size === "modal" ? "80px" : "64px"}
        />
      </div>
    );
  }

  return (
    <div
      className={`${className} flex shrink-0 items-center justify-center bg-gradient-to-br from-blue-700 to-cyan-500 text-xl font-black text-white ring-4 ring-white/20`}
    >
      {person.fullName.slice(0, 1).toUpperCase()}
    </div>
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-black text-slate-900">{value}</p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-black text-slate-900 [overflow-wrap:anywhere]">
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
    region: string;
    island: string;
    category: string;
  };
  active?: boolean;
}) {
  const params = new URLSearchParams();

  if (filters.q) params.set("q", filters.q);
  if (filters.region && filters.region !== "ALL") {
    params.set("region", filters.region);
  }
  if (filters.island) params.set("island", filters.island);
  if (filters.category && filters.category !== "ALL") {
    params.set("category", filters.category);
  }

  params.set("page", String(page));

  return (
    <Link
      href={`/database?${params.toString()}`}
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

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}