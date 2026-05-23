import Link from "next/link";
import { redirect } from "next/navigation";

import AppShell from "@/app/components/AppShell";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AddYaumiyyaForm from "./add-yaumiyya-form";

export default async function NewYaumiyyaPage() {
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

  const users = await prisma.user.findMany({
    where:
      session.role === "MAIN_ADMIN"
        ? { isActive: true }
        : { isActive: true, region: session.region as any },
    orderBy: { fullName: "asc" },
    select: {
      id: true,
      fullName: true,
      serviceNumber: true,
      region: true,
    },
  });

  return (
    <AppShell
      title="Add Yaumiyya"
      subtitle="Meeting notes, participants and assigned tasks"
      user={session}
    >
      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              Add Yaumiyya
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Update meeting notes in Dhivehi.
            </p>
          </div>

          <Link
            href="/yaumiyya"
            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white"
          >
            Back
          </Link>
        </div>

        <AddYaumiyyaForm
          userRole={session.role}
          userRegion={session.region}
          users={users}
        />
      </section>
    </AppShell>
  );
}