import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import ChangePasswordForm from "./change-password-form";

export default async function ChangePasswordPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950">
      <div className="relative flex min-h-screen items-center justify-center px-4 py-8">
        <div className="absolute left-[-120px] top-[-120px] h-80 w-80 rounded-full bg-blue-600/30 blur-3xl" />
        <div className="absolute bottom-[-140px] right-[-120px] h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />

        <div className="relative w-full max-w-md">
          <div className="mb-5 text-center text-white">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-blue-600 to-cyan-500 text-2xl font-black shadow-xl shadow-blue-600/30">
              RT
            </div>

            <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-200">
              Regional Task Log
            </p>

            <h1 className="mt-3 text-3xl font-black">Change Password</h1>

            <p className="mx-auto mt-3 max-w-sm text-sm font-semibold leading-6 text-slate-300">
              You are using a temporary password. Create your own password
              before entering the system.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white p-6 shadow-2xl shadow-blue-950/40 sm:p-7">
            <div className="mb-5 rounded-[1.5rem] bg-blue-50 p-4">
              <p className="text-sm font-black text-slate-900">
                Password Rules
              </p>
              <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
                Use a password you can remember. Minimum 6 characters. New
                password and confirm password must match.
              </p>
            </div>

            <ChangePasswordForm />
          </div>

          <p className="mt-5 text-center text-xs font-bold text-slate-400">
            For security, you cannot use the system until password is changed.
          </p>
        </div>
      </div>
    </main>
  );
}