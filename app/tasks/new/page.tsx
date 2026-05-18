import Link from "next/link";
import { redirect } from "next/navigation";

import AppShell from "@/app/components/AppShell";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AddTaskForm from "./add-task-form";

export default async function NewTaskPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.id },
    select: { mustChangePassword: true },
  });

  if (dbUser?.mustChangePassword) {
    redirect("/change-password");
  }

  const [sharedToOptions, requestTypeOptions] = await Promise.all([
    prisma.sharedToOption.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    }),

    prisma.requestTypeOption.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  return (
    <AppShell
      title="Add Task Update"
      subtitle={`${session.fullName} • ${session.serviceNumber} • ${
        session.role === "MAIN_ADMIN" ? "All Regions" : session.region
      }`}
      user={session}
    >
      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <div className="mb-5 flex items-center justify-between gap-3 lg:hidden">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              Add Task Update
            </h1>
            <p className="text-sm font-semibold text-slate-500">
              Create a new regional task record
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white"
          >
            Back
          </Link>
        </div>

        <AddTaskForm
          userRole={session.role}
          userRegion={session.region}
          userName={session.fullName}
          serviceNumber={session.serviceNumber}
          sharedToOptions={sharedToOptions}
          requestTypeOptions={requestTypeOptions}
        />
      </section>
    </AppShell>
  );
}