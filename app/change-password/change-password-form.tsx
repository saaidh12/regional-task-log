"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ChangePasswordForm() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!currentPassword.trim()) {
      setError("Please enter your current password.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from current password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to change password.");
        return;
      }

      setSuccess("Password changed successfully. Opening dashboard...");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.replace("/dashboard");
        router.refresh();
      }, 700);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PasswordInput
        label="Current Password"
        value={currentPassword}
        onChange={setCurrentPassword}
        autoComplete="current-password"
      />

      <PasswordInput
        label="New Password"
        value={newPassword}
        onChange={setNewPassword}
        autoComplete="new-password"
      />

      <PasswordInput
        label="Confirm New Password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        autoComplete="new-password"
      />

      <div className="rounded-2xl bg-slate-50 px-4 py-3">
        <p className="text-xs font-black uppercase tracking-wide text-slate-400">
          Password Check
        </p>

        <div className="mt-2 space-y-1 text-xs font-bold">
          <Rule ok={newPassword.length >= 6} text="At least 6 characters" />
          <Rule
            ok={newPassword.length > 0 && newPassword === confirmPassword}
            text="New password and confirm password match"
          />
          <Rule
            ok={
              currentPassword.length > 0 &&
              newPassword.length > 0 &&
              currentPassword !== newPassword
            }
            text="Different from current password"
          />
        </div>
      </div>

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

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? "Changing Password..." : "Change Password"}
      </button>
    </form>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-slate-700">
        {label}
      </span>

      <div className="flex overflow-hidden rounded-2xl border border-slate-200 bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className="min-w-0 flex-1 px-4 py-3 text-sm font-bold text-slate-900 outline-none"
        />

        <button
          type="button"
          onClick={() => setShow((current) => !current)}
          className="shrink-0 px-4 text-xs font-black text-blue-600 hover:bg-blue-50"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
    </label>
  );
}

function Rule({ ok, text }: { ok: boolean; text: string }) {
  return (
    <p className={ok ? "text-emerald-700" : "text-slate-400"}>
      {ok ? "✓" : "•"} {text}
    </p>
  );
}