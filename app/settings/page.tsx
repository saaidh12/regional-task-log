import { redirect } from "next/navigation";

import AppShell from "@/app/components/AppShell";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SettingsOptionsClient from "./settings-options-client";

export default async function SettingsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  if (session.role !== "MAIN_ADMIN") {
    redirect("/dashboard");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.id },
    select: { mustChangePassword: true },
  });

  if (dbUser?.mustChangePassword) {
    redirect("/change-password");
  }

  const [sharedToOptions, requestTypeOptions, crimeCategories] =
    await Promise.all([
      prisma.sharedToOption.findMany({
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          isActive: true,
        },
      }),

      prisma.requestTypeOption.findMany({
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          isActive: true,
        },
      }),

      prisma.crimeCategory.findMany({
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
          isActive: true,
        },
      }),
    ]);

  return (
    <AppShell
      title="Settings"
      subtitle="Manage task and database dropdown options"
      user={session}
    >
      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <SettingsOptionsClient
          sharedToOptions={sharedToOptions}
          requestTypeOptions={requestTypeOptions}
          crimeCategories={crimeCategories}
        />
      </section>
    </AppShell>
  );
}