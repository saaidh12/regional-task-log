import { redirect } from "next/navigation";

import AppShell from "@/app/components/AppShell";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SupportClient, { type SupportTicketItem } from "./support-client";

const PAGE_SIZE = 12;

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    priority?: string;
    category?: string;
    page?: string;
  }>;
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

  const params = await searchParams;

  const q = String(params.q || "").trim();
  const status = String(params.status || "ALL").trim();
  const priority = String(params.priority || "ALL").trim();
  const category = String(params.category || "ALL").trim();

  const currentPage = Math.max(Number(params.page || "1"), 1);
  const skip = (currentPage - 1) * PAGE_SIZE;

  const where: any =
    session.role === "MAIN_ADMIN"
      ? {}
      : {
          createdByUserId: session.id,
        };

  if (status !== "ALL") where.status = status;
  if (priority !== "ALL") where.priority = priority;
  if (category !== "ALL") where.category = category;

  if (q) {
    where.OR = [
      { ticketNumber: { contains: q } },
      { subject: { contains: q } },
      { details: { contains: q } },
      { createdByName: { contains: q } },
      { createdByServiceNumber: { contains: q } },
    ];
  }

  const [tickets, totalTickets] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      orderBy: {
        updatedAt: "desc",
      },
      skip,
      take: PAGE_SIZE,
      include: {
        attachments: {
          select: {
            id: true,
          },
        },
        replies: {
          select: {
            id: true,
          },
        },
      },
    }),

    prisma.supportTicket.count({ where }),
  ]);

  const totalPages = Math.max(Math.ceil(totalTickets / PAGE_SIZE), 1);

  const safeTickets: SupportTicketItem[] = tickets.map((ticket) => ({
    id: ticket.id,
    ticketNumber: ticket.ticketNumber,
    subject: ticket.subject,
    details: ticket.details,
    category: ticket.category,
    priority: ticket.priority,
    status: ticket.status,
    createdByName: ticket.createdByName,
    createdByServiceNumber: ticket.createdByServiceNumber,
    createdByRegion: ticket.createdByRegion || "",
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
    attachmentCount: ticket.attachments.length,
    replyCount: ticket.replies.length,
  }));

  return (
    <AppShell
      title="Support"
      subtitle={
        session.role === "MAIN_ADMIN"
          ? "All support tickets"
          : "My support tickets"
      }
      user={session}
    >
      <SupportClient
        tickets={safeTickets}
        session={{
          role: session.role,
          region: session.region,
        }}
        filters={{
          q,
          status,
          priority,
          category,
        }}
        pagination={{
          currentPage,
          totalPages,
          totalTickets,
          pageSize: PAGE_SIZE,
        }}
      />
    </AppShell>
  );
}