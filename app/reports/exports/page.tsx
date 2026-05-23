import { redirect } from "next/navigation";

import AppShell from "@/app/components/AppShell";
import { getSession } from "@/lib/auth";
import ExportClient from "./export-client";

export default async function ReportExportsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  if (session.role !== "MAIN_ADMIN") {
    redirect("/dashboard");
  }

  const now = new Date();

  return (
    <AppShell
      title="Export Reports"
      subtitle="Main Admin monthly Word export"
      user={session}
    >
      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <ExportClient
          defaultMonth={String(now.getMonth() + 1).padStart(2, "0")}
          defaultYear={String(now.getFullYear())}
        />
      </section>
    </AppShell>
  );
}