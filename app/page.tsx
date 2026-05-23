"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setError("");

    if (!username.trim()) {
      setError("Please enter your username.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed.");
        return;
      }

      router.replace(data.redirectTo || "/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950">
      <div className="relative flex min-h-screen items-center justify-center px-4 py-8">
        <div className="absolute left-[-120px] top-[-120px] h-80 w-80 rounded-full bg-blue-600/30 blur-3xl" />
        <div className="absolute bottom-[-140px] right-[-120px] h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="relative w-full max-w-md">
          <div className="mb-6 text-center text-white">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-blue-600 to-cyan-500 text-2xl font-black shadow-xl shadow-blue-600/30">
              RT
            </div>

            <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-200">
              Internal Work System
            </p>

            <h1 className="mt-3 text-3xl font-black sm:text-4xl">
              Regional Task Log
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-sm font-semibold leading-6 text-slate-300">
              Secure login for regional task records, Yaumiyya, information
              sharing, database and support tickets.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white p-6 shadow-2xl shadow-blue-950/40 sm:p-7">
            <div className="mb-5 rounded-[1.5rem] bg-blue-50 p-4">
              <p className="text-sm font-black text-slate-900">
                Login Required
              </p>
              <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
                Enter your username and password issued by Main Admin.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-black text-slate-700">
                  Username
                </span>

                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  placeholder="Enter username"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-black text-slate-700">
                  Password
                </span>

                <div className="flex overflow-hidden rounded-2xl border border-slate-200 bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter password"
                    className="min-w-0 flex-1 px-4 py-3 text-sm font-bold text-slate-900 outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="shrink-0 px-4 text-xs font-black text-blue-600 hover:bg-blue-50"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </label>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Login to System"}
              </button>
            </form>
          </div>

          <p className="mt-5 text-center text-xs font-bold leading-5 text-slate-400">
            Unauthorized access is not allowed. Disabled users cannot login.
          </p>
        </div>
      </div>
    </main>
  );
}