import { redirect } from "next/navigation";

import AppShell from "@/app/components/AppShell";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import InformationClient, {
  type InformationItem,
  type InfoAreaFilterItem,
} from "./information-client";

const PAGE_SIZE = 12;

export default async function InformationPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    area?: string;
    priority?: string;
    from?: string;
    to?: string;
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
  const area = String(params.area || "ALL").trim();
  const priority = String(params.priority || "ALL").trim();
  const from = String(params.from || "").trim();
  const to = String(params.to || "").trim();

  const currentPage = Math.max(Number(params.page || "1"), 1);
  const skip = (currentPage - 1) * PAGE_SIZE;

  const where: any = {};

  if (priority !== "ALL") {
    where.priority = priority;
  }

  if (area !== "ALL") {
    where.sharedToAreas = {
      some: {
        area: {
          name: area,
        },
      },
    };
  } else if (session.role !== "MAIN_ADMIN" && session.region) {
    where.sharedToAreas = {
      some: {
        area: {
          name: session.region,
        },
      },
    };
  }

  if (from || to) {
    where.date = {};

    if (from) {
      where.date.gte = new Date(`${from}T00:00:00.000Z`);
    }

    if (to) {
      where.date.lte = new Date(`${to}T23:59:59.999Z`);
    }
  }

  if (q) {
    where.OR = [
      { title: { contains: q } },
      { details: { contains: q } },
      { source: { contains: q } },
      { remarks: { contains: q } },
      { createdByName: { contains: q } },
      { createdByServiceNumber: { contains: q } },
      {
        sharedToAreas: {
          some: {
            area: {
              name: {
                contains: q,
              },
            },
          },
        },
      },
    ];
  }

  const [records, totalRecords, areas] = await Promise.all([
    prisma.infoShare.findMany({
      where,
      orderBy: {
        date: "desc",
      },
      skip,
      take: PAGE_SIZE,
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
    }),

    prisma.infoShare.count({ where }),

    prisma.infoShareArea.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        isActive: true,
      },
    }),
  ]);

  const totalPages = Math.max(Math.ceil(totalRecords / PAGE_SIZE), 1);

  const safeRecords: InformationItem[] = records.map((record) => ({
    id: record.id,
    date: record.date.toISOString(),
    title: record.title,
    details: record.details,
    source: record.source || "",
    remarks: record.remarks || "",
    priority: record.priority,
    createdByName: record.createdByName,
    createdByServiceNumber: record.createdByServiceNumber,
    createdByRegion: record.createdByRegion || "",
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    sharedToAreas: record.sharedToAreas.map((item) => ({
      id: item.area.id,
      name: item.area.name,
    })),
  }));

  const safeAreas: InfoAreaFilterItem[] = areas.map((item) => ({
    id: item.id,
    name: item.name,
    isActive: item.isActive,
  }));

  return (
    <AppShell
      title="Information Shared"
      subtitle="Information shared to regions and areas"
      user={session}
    >
      <InformationClient
        records={safeRecords}
        areas={safeAreas}
        session={{
          role: session.role,
          region: session.region,
        }}
        filters={{
          q,
          area,
          priority,
          from,
          to,
        }}
        pagination={{
          currentPage,
          totalPages,
          totalRecords,
          pageSize: PAGE_SIZE,
        }}
      />
    </AppShell>
  );
}