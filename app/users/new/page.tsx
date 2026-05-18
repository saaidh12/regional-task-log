import { redirect } from "next/navigation";
import Link from "next/link";

import { getSession } from "@/lib/auth";
import CreateUserForm from "./create-user-form";

export default async function NewUserPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  if (session.role !== "MAIN_ADMIN") {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              Create User
            </h1>
            <p className="text-sm text-slate-500">
              Add a new staff login to the system
            </p>
          </div>

          <Link
            href="/users"
            className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-bold text-slate-700"
          >
            Back
          </Link>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-4 py-6">
        <CreateUserForm />
      </section>
    </main>
  );
}