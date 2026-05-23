import Link from "next/link";
import { redirect } from "next/navigation";

import AppShell from "@/app/components/AppShell";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SupportTicketDetailClient from "./support-ticket-detail-client";

export default async function SupportTicketDetailPage({
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

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      attachments: {
        orderBy: {
          createdAt: "asc",
        },
      },
      replies: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!ticket) {
    redirect("/support");
  }

  const canAccess =
    session.role === "MAIN_ADMIN" || ticket.createdByUserId === session.id;

  if (!canAccess) {
    redirect("/support");
  }

  const safeTicket = {
    id: ticket.id,
    ticketNumber: ticket.ticketNumber,
    subject: ticket.subject,
    details: ticket.details,
    category: ticket.category,
    priority: ticket.priority,
    status: ticket.status,
    adminNote: ticket.adminNote || "",
    createdByName: ticket.createdByName,
    createdByServiceNumber: ticket.createdByServiceNumber,
    createdByRegion: ticket.createdByRegion || "",
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
    attachments: ticket.attachments.map((attachment) => ({
      id: attachment.id,
      fileUrl: attachment.fileUrl,
      fileName: attachment.fileName,
      fileType: attachment.fileType,
      fileSize: attachment.fileSize,
      createdAt: attachment.createdAt.toISOString(),
    })),
    replies: ticket.replies.map((reply) => ({
      id: reply.id,
      message: reply.message,
      createdByName: reply.createdByName,
      createdByServiceNumber: reply.createdByServiceNumber,
      createdAt: reply.createdAt.toISOString(),
    })),
  };

  return (
    <AppShell
      title="Support Ticket"
      subtitle={ticket.ticketNumber}
      user={session}
    >
      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              {ticket.ticketNumber}
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              {ticket.subject}
            </p>
          </div>

          <Link
            href="/support"
            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white"
          >
            Back
          </Link>
        </div>

        <SupportTicketDetailClient
          ticket={safeTicket}
          userRole={session.role}
        />
      </section>
    </AppShell>
  );
}