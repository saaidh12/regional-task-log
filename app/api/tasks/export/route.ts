import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatStatus(status: string) {
  if (status === "PENDING") return "Pending";
  if (status === "IN_PROGRESS") return "In Progress";
  if (status === "COMPLETED") return "Completed";
  if (status === "CLOSED") return "Closed";
  return status;
}

export async function GET(req: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please login again." },
        { status: 401 }
      );
    }

    const url = new URL(req.url);

    const q = String(url.searchParams.get("q") || "").trim();
    const selectedRegion = String(url.searchParams.get("region") || "ALL");
    const selectedStatus = String(url.searchParams.get("status") || "ALL");

    const where: any = {};

    if (session.role === "MAIN_ADMIN") {
      if (selectedRegion !== "ALL") {
        where.region = selectedRegion;
      }
    } else {
      where.region = session.region;
    }

    if (selectedStatus !== "ALL") {
      where.status = selectedStatus;
    }

    if (q) {
      where.OR = [
        { taskNumber: { contains: q } },
        { atoll: { contains: q } },
        { description: { contains: q } },
        { informationProvided: { contains: q } },
        { createdByName: { contains: q } },
        { createdByServiceNumber: { contains: q } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: 5000,
    });

    const headers = [
      "Task Number",
      "Date",
      "Region",
      "Atoll",
      "Status",
      "Task Description",
      "Information Provided",
      "Created By",
      "Service Number",
      "Created At",
      "Updated At",
    ];

    const rows = tasks.map((task) => [
      task.taskNumber,
      formatDate(task.date),
      task.region,
      task.atoll,
      formatStatus(task.status),
      task.description,
      task.informationProvided,
      task.createdByName,
      task.createdByServiceNumber,
      formatDateTime(task.createdAt),
      formatDateTime(task.updatedAt),
    ]);

    const csv =
      "\uFEFF" +
      [headers, ...rows]
        .map((row) => row.map((cell) => csvEscape(cell)).join(","))
        .join("\n");

    const fileName = `task-records-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("EXPORT_TASKS_ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong while exporting tasks." },
      { status: 500 }
    );
  }
}