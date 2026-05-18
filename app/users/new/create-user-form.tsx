"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const REGIONS = ["SPR", "SCPR", "NCPR", "NPR", "UNPR"];

export default function CreateUserForm() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [serviceNumber, setServiceNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("123456");
  const [rank, setRank] = useState("");
  const [region, setRegion] = useState("NPR");
  const [role, setRole] = useState("STAFF");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          serviceNumber,
          mobileNumber,
          username,
          password,
          rank,
          region,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create user.");
        return;
      }

      setSuccess("User created successfully.");

      setFullName("");
      setServiceNumber("");
      setMobileNumber("");
      setUsername("");
      setPassword("123456");
      setRank("");
      setRegion("NPR");
      setRole("STAFF");

      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-7 shadow-sm"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input
          label="Full Name"
          value={fullName}
          onChange={setFullName}
          placeholder="Staff full name"
        />

        <Input
          label="Service Number"
          value={serviceNumber}
          onChange={setServiceNumber}
          placeholder="Example: 12345"
        />

        <Input
          label="Mobile Number"
          value={mobileNumber}
          onChange={setMobileNumber}
          placeholder="Example: +9607777777"
        />

        <Input
          label="Username"
          value={username}
          onChange={setUsername}
          placeholder="Example: ahmed123"
        />

        <Input
          label="Temporary Password"
          value={password}
          onChange={setPassword}
          placeholder="Temporary password"
          type="text"
        />

        <Input
          label="Rank"
          value={rank}
          onChange={setRank}
          placeholder="Example: Sergeant"
        />

        <div>
          <label className="block text-sm font-black text-slate-700 mb-2">
            Region
          </label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            disabled={role === "MAIN_ADMIN"}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
          >
            {REGIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-black text-slate-700 mb-2">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              if (e.target.value === "MAIN_ADMIN") {
                setRegion("NPR");
              }
            }}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            <option value="STAFF">STAFF</option>
            <option value="MAIN_ADMIN">MAIN_ADMIN</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mt-5 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-5 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-bold text-emerald-700">
          {success}
        </div>
      )}

      <div className="mt-7 flex flex-col sm:flex-row gap-3 sm:justify-end">
        <button
          type="button"
          onClick={() => router.push("/users")}
          className="rounded-2xl bg-slate-200 px-5 py-3 font-black text-slate-700"
        >
          Cancel
        </button>

        <button
          disabled={loading}
          className="rounded-2xl bg-blue-600 px-5 py-3 font-black text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create User"}
        </button>
      </div>
    </form>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-black text-slate-700 mb-2">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
}