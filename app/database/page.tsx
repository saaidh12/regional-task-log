import { redirect } from "next/navigation";

import AppShell from "@/app/components/AppShell";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PersonDatabaseClient, {
  type PersonItem,
  type CrimeCategoryFilterItem,
} from "./person-database-client";

const PAGE_SIZE = 15;

export default async function DatabasePage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    region?: string;
    island?: string;
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
  const selectedRegion = String(params.region || "ALL");
  const selectedIsland = String(params.island || "").trim();
  const selectedCategory = String(params.category || "ALL").trim();

  const currentPage = Math.max(Number(params.page || "1"), 1);
  const skip = (currentPage - 1) * PAGE_SIZE;

  const where: any = {};

  if (session.role === "MAIN_ADMIN") {
    if (selectedRegion !== "ALL") {
      where.region = selectedRegion;
    }
  } else {
    where.region = session.region;
  }

  if (selectedIsland) {
    where.island = {
      contains: selectedIsland,
    };
  }

  if (selectedCategory !== "ALL") {
    where.crimeCategories = {
      some: {
        crimeCategoryId: selectedCategory,
      },
    };
  }

  if (q) {
    where.OR = [
      { fullName: { contains: q } },
      { idNumber: { contains: q } },
      { mobileNumber: { contains: q } },
      { address: { contains: q } },
      { island: { contains: q } },
      { notes: { contains: q } },
      {
        nicknames: {
          some: {
            name: {
              contains: q,
            },
          },
        },
      },
    ];
  }

  const categoryWhere =
    session.role === "MAIN_ADMIN"
      ? {}
      : {
          region: session.region as any,
        };

  const [people, totalPeople, crimeCategories] = await Promise.all([
    prisma.personRecord.findMany({
      where,
      orderBy: {
        updatedAt: "desc",
      },
      skip,
      take: PAGE_SIZE,
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
    }),

    prisma.personRecord.count({ where }),

    prisma.crimeCategory.findMany({
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
        isActive: true,
      },
    }),
  ]);

  const totalPages = Math.max(Math.ceil(totalPeople / PAGE_SIZE), 1);

  const safePeople: PersonItem[] = people.map((person) => ({
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
    createdByName: person.createdByName,
    createdByServiceNumber: person.createdByServiceNumber,
    createdAt: person.createdAt.toISOString(),
    updatedAt: person.updatedAt.toISOString(),
    nicknames: person.nicknames.map((item) => ({
      id: item.id,
      name: item.name,
    })),
    crimeCategories: person.crimeCategories.map((item) => ({
      id: item.crimeCategory.id,
      name: item.crimeCategory.name,
      region: item.crimeCategory.region,
    })),
  }));

  const safeCrimeCategories: CrimeCategoryFilterItem[] = crimeCategories.map(
    (category) => ({
      id: category.id,
      name: category.name,
      region: category.region,
      isActive: category.isActive,
    })
  );

  return (
    <AppShell
      title="Database"
      subtitle={
        session.role === "MAIN_ADMIN"
          ? "All region person database"
          : `${session.region} person database`
      }
      user={session}
    >
      <PersonDatabaseClient
        people={safePeople}
        crimeCategories={safeCrimeCategories}
        session={{
          role: session.role,
          region: session.region,
        }}
        filters={{
          q,
          region: selectedRegion,
          island: selectedIsland,
          category: selectedCategory,
        }}
        pagination={{
          currentPage,
          totalPages,
          totalPeople,
          pageSize: PAGE_SIZE,
        }}
      />
    </AppShell>
  );
}