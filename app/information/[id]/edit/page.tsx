import Link from "next/link";
import { redirect } from "next/navigation";

import AppShell from "@/app/components/AppShell";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EditInformationForm from "./edit-information-form";

export default async function EditInformationPage({
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

  const record = await prisma.infoShare.findUnique({
    where: { id },
    include: {
      sharedToAreas: {
        include: {
          area: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!record) {
    redirect("/information");
  }

  const canEdit =
    session.role === "MAIN_ADMIN" || record.createdByUserId === session.id;

  if (!canEdit) {
    redirect("/information");
  }

  const areas = await prisma.infoShareArea.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
    },
  });

  const safeRecord = {
    id: record.id,
    date: record.date.toISOString().slice(0, 10),
    title: record.title,
    details: record.details,
    source: record.source || "",
    remarks: record.remarks || "",
    priority: record.priority,
    selectedAreaIds: record.sharedToAreas.map((item) => item.area.id),
  };

  return (
    <AppShell
      title="Edit Information"
      subtitle={record.title}
      user={session}
    >
      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              Edit Information
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Update shared information details.
            </p>
          </div>

          <Link
            href="/information"
            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white"
          >
            Back
          </Link>
        </div>

        <EditInformationForm
          record={safeRecord}
          areas={areas}
          userRole={session.role}
        />
      </section>
    </AppShell>
  );
}