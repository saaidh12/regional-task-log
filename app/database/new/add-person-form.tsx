"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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

type CrimeCategoryItem = {
  id: string;
  name: string;
  region: string;
};

export default function AddPersonForm({
  userRole,
  userRegion,
  userName,
  serviceNumber,
  crimeCategories,
}: {
  userRole: "MAIN_ADMIN" | "STAFF";
  userRegion: string | null;
  userName: string;
  serviceNumber: string;
  crimeCategories: CrimeCategoryItem[];
}) {
  const router = useRouter();

  const [photoUrl, setPhotoUrl] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [fullName, setFullName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [address, setAddress] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [region, setRegion] = useState(userRegion || "NPR");
  const [atoll, setAtoll] = useState("R");
  const [island, setIsland] = useState("");
  const [notes, setNotes] = useState("");

  const [nicknameInput, setNicknameInput] = useState("");
  const [nicknames, setNicknames] = useState<string[]>([]);
  const [selectedCrimeCategories, setSelectedCrimeCategories] = useState<
    string[]
  >([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const visibleCrimeCategories = useMemo(() => {
    return crimeCategories.filter((item) => item.region === region);
  }, [crimeCategories, region]);

  const selectedCrimeNames = useMemo(() => {
    return crimeCategories
      .filter((item) => selectedCrimeCategories.includes(item.id))
      .map((item) => item.name);
  }, [crimeCategories, selectedCrimeCategories]);

  function handleIdNumberChange(value: string) {
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
    setIdNumber(clean);
  }

  async function handlePhotoUpload(file: File | null) {
    if (!file) return;

    setError("");
    setUploadingPhoto(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/persons/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to upload image.");
        return;
      }

      setPhotoUrl(data.url);
    } catch {
      setError("Image upload failed. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  function addNickname() {
    const clean = nicknameInput.trim();

    if (!clean) return;

    if (!nicknames.includes(clean)) {
      setNicknames([...nicknames, clean]);
    }

    setNicknameInput("");
  }

  function removeNickname(name: string) {
    setNicknames(nicknames.filter((item) => item !== name));
  }

  function toggleCrimeCategory(id: string) {
    if (selectedCrimeCategories.includes(id)) {
      setSelectedCrimeCategories(
        selectedCrimeCategories.filter((item) => item !== id)
      );
    } else {
      setSelectedCrimeCategories([...selectedCrimeCategories, id]);
    }
  }

  function handleRegionChange(value: string) {
    setRegion(value);
    setSelectedCrimeCategories([]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (idNumber && !/^[A-Z]\d{6}$/.test(idNumber)) {
      setError("ID number must be in this format: A000000");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/persons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          photoUrl,
          fullName,
          idNumber,
          address,
          mobileNumber,
          region,
          atoll,
          island,
          notes,
          nicknames,
          crimeCategoryIds: selectedCrimeCategories,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save person record.");
        return;
      }

      setSuccess("Person record saved successfully.");

      setPhotoUrl("");
      setFullName("");
      setIdNumber("");
      setAddress("");
      setMobileNumber("");
      setIsland("");
      setNotes("");
      setNicknameInput("");
      setNicknames([]);
      setSelectedCrimeCategories([]);

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
        <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-sky-950 via-blue-800 to-cyan-600 text-white shadow-xl shadow-blue-900/20">
          <div className="p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-100">
              Person Database
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Add Person
            </h2>

            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-blue-100">
              Add person information, nicknames, location and region-based crime
              categories.
            </p>
          </div>
        </div>

        <SectionCard
          number="01"
          title="Basic Information"
          subtitle="Upload image, add name, ID and contact number."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Person Image">
              <div className="rounded-[1.5rem] border border-blue-100 bg-blue-50/60 p-4">
                {photoUrl ? (
                  <div className="mb-4 flex items-center gap-4">
                    <img
                      src={photoUrl}
                      alt="Person preview"
                      className="h-20 w-20 rounded-2xl object-cover ring-4 ring-white"
                    />

                    <div className="min-w-0">
                      <p className="text-sm font-black text-slate-900">
                        Image uploaded
                      </p>
                      <p className="mt-1 break-all text-xs font-bold text-slate-500">
                        {photoUrl}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 rounded-2xl bg-white p-4 text-center">
                    <p className="text-sm font-black text-slate-800">
                      No image uploaded
                    </p>
                    <p className="mt-1 text-xs font-bold text-slate-500">
                      JPG, PNG or WEBP below 5MB
                    </p>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) =>
                    handlePhotoUpload(e.target.files?.[0] || null)
                  }
                  className="block w-full text-sm font-bold text-slate-600 file:mr-4 file:rounded-2xl file:border-0 file:bg-blue-600 file:px-4 file:py-3 file:text-sm file:font-black file:text-white hover:file:bg-blue-700"
                />

                {uploadingPhoto && (
                  <p className="mt-3 text-sm font-black text-blue-700">
                    Uploading image...
                  </p>
                )}

                {photoUrl && (
                  <button
                    type="button"
                    onClick={() => setPhotoUrl("")}
                    className="mt-3 rounded-2xl bg-red-50 px-4 py-2 text-xs font-black text-red-700 hover:bg-red-100"
                  >
                    Remove Image
                  </button>
                )}
              </div>
            </Field>

            <Field label="Full Name">
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name"
                className="input"
              />
            </Field>

            <Field label="ID Number">
              <input
                value={idNumber}
                onChange={(e) => handleIdNumberChange(e.target.value)}
                placeholder="A000000"
                maxLength={7}
                className="input uppercase"
              />

              <p className="mt-2 text-xs font-bold text-slate-400">
                Format: A000000
              </p>
            </Field>

            <Field label="Mobile Number">
              <input
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="Mobile number"
                className="input"
              />
            </Field>
          </div>
        </SectionCard>

        <SectionCard
          number="02"
          title="Nicknames"
          subtitle="Add one or more nicknames."
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              placeholder="Nickname"
              className="input flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addNickname();
                }
              }}
            />

            <button
              type="button"
              onClick={addNickname}
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700"
            >
              Add Nickname
            </button>
          </div>

          {nicknames.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {nicknames.map((name) => (
                <button
                  type="button"
                  key={name}
                  onClick={() => removeNickname(name)}
                  className="rounded-2xl bg-blue-50 px-4 py-2 text-sm font-black text-blue-700 hover:bg-red-50 hover:text-red-700"
                >
                  {name} ×
                </button>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          number="03"
          title="Location"
          subtitle="Each region can only see its own database records."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Region">
              <select
                value={region}
                onChange={(e) => handleRegionChange(e.target.value)}
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
                placeholder="Island"
                className="input"
              />
            </Field>

            <Field label="Address">
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Address"
                className="input"
              />
            </Field>
          </div>
        </SectionCard>

        <SectionCard
          number="04"
          title="Crime Categories"
          subtitle="Categories are different for each region. Select one or more."
        >
          {visibleCrimeCategories.length === 0 ? (
            <div className="rounded-2xl bg-amber-50 p-4 text-sm font-black text-amber-700">
              No crime categories added for this region.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {visibleCrimeCategories.map((category) => {
                const active = selectedCrimeCategories.includes(category.id);

                return (
                  <button
                    type="button"
                    key={category.id}
                    onClick={() => toggleCrimeCategory(category.id)}
                    className={`rounded-2xl px-4 py-2 text-sm font-black transition ${
                      active
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    }`}
                  >
                    {active ? "✓ " : ""}
                    {category.name}
                  </button>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard
          number="05"
          title="Notes"
          subtitle="Optional remarks or intelligence notes."
        >
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            dir="auto"
            placeholder="ނޯޓް..."
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
            <button
              type="button"
              onClick={() => router.push("/database")}
              className="rounded-2xl bg-slate-200 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-300"
            >
              Cancel
            </button>

            <button
              disabled={loading || uploadingPhoto}
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save Person"}
            </button>
          </div>
        </div>
      </form>

      <aside className="space-y-4 xl:sticky xl:top-24 xl:h-fit">
        <div className="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-sm">
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
            <SummaryRow label="Name" value={fullName || "-"} />
            <SummaryRow label="ID Number" value={idNumber || "-"} />
            <SummaryRow label="Region" value={region || "-"} />
            <SummaryRow label="Island" value={island || "-"} />
            <SummaryRow
              label="Nicknames"
              value={nicknames.length ? nicknames.join(", ") : "-"}
            />
            <SummaryRow
              label="Categories"
              value={
                selectedCrimeNames.length ? selectedCrimeNames.join(", ") : "-"
              }
            />
          </div>
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