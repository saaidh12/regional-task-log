import Link from "next/link";
import { redirect } from "next/navigation";

import AppShell from "@/app/components/AppShell";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CreateSupportTicketForm from "./create-support-ticket-form";

export default async function NewSupportTicketPage() {
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

  return (
    <AppShell
      title="Create Ticket"
      subtitle="Report a problem or request support"
      user={session}
    >
      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              Create Support Ticket
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Report bugs, problems, login issues, data issues or change
              requests.
            </p>
          </div>

          <Link
            href="/support"
            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white"
          >
            Back
          </Link>
        </div>

        <CreateSupportTicketForm />
      </section>
    </AppShell>
  );
}