import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import ChangePasswordForm from "./change-password-form";

export default async function ChangePasswordPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="rounded-[2rem] bg-white p-7 shadow-2xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-xl font-black text-white">
              RT
            </div>

            <h1 className="text-2xl font-black text-slate-900">
              Change Password
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              You are using a temporary password. Please create your own
              password before using the system.
            </p>
          </div>

          <ChangePasswordForm />
        </div>
      </div>
    </main>
  );
}