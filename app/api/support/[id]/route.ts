import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STATUSES = ["OPEN", "IN_PROGRESS", "FIXED", "CLOSED", "REJECTED"] as const;

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please login again." },
        { status: 401 }
      );
    }

    const { id } = await params;

    const existingTicket = await prisma.supportTicket.findUnique({
      where: { id },
    });

    if (!existingTicket) {
      return NextResponse.json(
        { error: "Support ticket not found." },
        { status: 404 }
      );
    }

    const canAccess =
      session.role === "MAIN_ADMIN" || existingTicket.createdByUserId === session.id;

    if (!canAccess) {
      return NextResponse.json(
        { error: "You cannot access this ticket." },
        { status: 403 }
      );
    }

    const body = await req.json();

    const status = String(body.status || existingTicket.status).trim();
    const adminNote = String(body.adminNote || "").trim();
    const replyMessage = String(body.replyMessage || "").trim();

    if (!STATUSES.includes(status as any)) {
      return NextResponse.json(
        { error: "Invalid ticket status." },
        { status: 400 }
      );
    }

    const updateData: any = {};

    if (session.role === "MAIN_ADMIN") {
      updateData.status = status as any;
      updateData.adminNote = adminNote || null;
    }

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: updateData,
    });

    if (replyMessage) {
      await prisma.supportTicketReply.create({
        data: {
          ticketId: id,
          message: replyMessage,

          createdByUserId: session.id,
          createdByName: session.fullName,
          createdByServiceNumber: session.serviceNumber,
        },
      });
    }

    return NextResponse.json({ success: true, ticket });
  } catch (error) {
    console.error("UPDATE_SUPPORT_TICKET_ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong while updating ticket." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session || session.role !== "MAIN_ADMIN") {
      return NextResponse.json(
        { error: "Only Main Admin can delete support tickets." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existingTicket = await prisma.supportTicket.findUnique({
      where: { id },
    });

    if (!existingTicket) {
      return NextResponse.json(
        { error: "Support ticket not found." },
        { status: 404 }
      );
    }

    await prisma.supportTicket.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Support ticket deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE_SUPPORT_TICKET_ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong while deleting ticket." },
      { status: 500 }
    );
  }
}