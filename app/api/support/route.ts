import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const CATEGORIES = [
  "BUG",
  "CHANGE_REQUEST",
  "LOGIN_ISSUE",
  "DATA_ISSUE",
  "IMAGE_UPLOAD",
  "OTHER",
] as const;

const PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"] as const;

type SupportAttachmentInput = {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
};

function generateTicketNumber() {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();

  return `TKT-${y}${m}${d}-${random}`;
}

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please login again." },
        { status: 401 }
      );
    }

    const body = await req.json();

    const subject = String(body.subject || "").trim();
    const details = String(body.details || "").trim();
    const category = String(body.category || "OTHER").trim();
    const priority = String(body.priority || "NORMAL").trim();

    const attachments: SupportAttachmentInput[] = Array.isArray(
      body.attachments
    )
      ? body.attachments
          .map((item: unknown): SupportAttachmentInput => {
            const attachment = item as {
              fileUrl?: unknown;
              fileName?: unknown;
              fileType?: unknown;
              fileSize?: unknown;
            };

            return {
              fileUrl: String(attachment.fileUrl || "").trim(),
              fileName: String(attachment.fileName || "").trim(),
              fileType: String(attachment.fileType || "").trim(),
              fileSize: Number(attachment.fileSize || 0),
            };
          })
          .filter(
            (item: SupportAttachmentInput) => item.fileUrl && item.fileName
          )
      : [];

    if (!subject || !details) {
      return NextResponse.json(
        { error: "Please fill subject and details." },
        { status: 400 }
      );
    }

    if (!CATEGORIES.includes(category as any)) {
      return NextResponse.json(
        { error: "Invalid category selected." },
        { status: 400 }
      );
    }

    if (!PRIORITIES.includes(priority as any)) {
      return NextResponse.json(
        { error: "Invalid priority selected." },
        { status: 400 }
      );
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber: generateTicketNumber(),
        subject,
        details,
        category: category as any,
        priority: priority as any,
        status: "OPEN",

        createdByUserId: session.id,
        createdByName: session.fullName,
        createdByServiceNumber: session.serviceNumber,
        createdByRegion: session.region as any,

        attachments: {
          create: attachments.map((attachment) => ({
            fileUrl: attachment.fileUrl,
            fileName: attachment.fileName,
            fileType: attachment.fileType,
            fileSize: attachment.fileSize,
          })),
        },
      },
      include: {
        attachments: true,
      },
    });

    return NextResponse.json({ success: true, ticket });
  } catch (error) {
    console.error("CREATE_SUPPORT_TICKET_ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong while creating support ticket." },
      { status: 500 }
    );
  }
}