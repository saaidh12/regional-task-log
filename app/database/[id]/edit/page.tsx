import Link from "next/link";
import { redirect } from "next/navigation";

import AppShell from "@/app/components/AppShell";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EditPersonForm from "./edit-person-form";

export default async function EditPersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

  const { id } = await params;

  const person = await prisma.personRecord.findUnique({
    where: { id },
    include: {
      nicknames: {
        select: {
          id: true,
          name: true,
        },
      },
      crimeCategories: {
        include: {
          crimeCategory: {
            select: {
              id: true,
              name: true,
              region: true,
            },
          },
        },
      },
    },
  });

  if (!person) {
    redirect("/database");
  }

  if (session.role !== "MAIN_ADMIN" && person.region !== session.region) {
    redirect("/database");
  }

  const categoryWhere =
    session.role === "MAIN_ADMIN"
      ? { isActive: true }
      : {
          isActive: true,
          region: session.region as any,
        };

  const crimeCategories = await prisma.crimeCategory.findMany({
    where: categoryWhere,
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

  const safePerson = {
    id: person.id,
    photoUrl: person.photoUrl || "",
    fullName: person.fullName,
    idNumber: person.idNumber || "",
    address: person.address || "",
    mobileNumber: person.mobileNumber || "",
    region: person.region,
    atoll: person.atoll || "",
    island: person.island || "",
    notes: person.notes || "",
    nicknames: person.nicknames.map((item) => item.name),
    selectedCrimeCategoryIds: person.crimeCategories.map(
      (item) => item.crimeCategory.id
    ),
  };

  return (
    <AppShell
      title="Edit Person"
      subtitle={person.fullName}
      user={session}
    >
      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              Edit Person Record
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              {person.fullName}
            </p>
          </div>

          <Link
            href="/database"
            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white"
          >
            Back
          </Link>
        </div>

        <EditPersonForm
          person={safePerson}
          userRole={session.role}
          userRegion={session.region}
          crimeCategories={crimeCategories}
        />
      </section>
    </AppShell>
  );
}