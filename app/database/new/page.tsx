import Link from "next/link";
import { redirect } from "next/navigation";

import AppShell from "@/app/components/AppShell";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AddPersonForm from "./add-person-form";

export default async function NewPersonPage() {
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

  const where =
    session.role === "MAIN_ADMIN"
      ? { isActive: true }
      : {
          isActive: true,
          region: session.region as any,
        };

  const crimeCategories = await prisma.crimeCategory.findMany({
    where,
    orderBy: [
      {
        region: "asc",
      },
      {
        name: "asc",
      },
    ],
    select: {
      id: true,
      name: true,
      region: true,
    },
  });

  return (
    <AppShell
      title="Add Person"
      subtitle="Create a new person database record"
      user={session}
    >
      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              Add Person Record
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Add person details, nicknames and crime categories.
            </p>
          </div>

          <Link
            href="/database"
            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white"
          >
            Back
          </Link>
        </div>

        <AddPersonForm
          userRole={session.role}
          userRegion={session.region}
          userName={session.fullName}
          serviceNumber={session.serviceNumber}
          crimeCategories={crimeCategories}
        />
      </section>
    </AppShell>
  );
}