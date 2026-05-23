import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const OPTION_TYPES = ["SHARED_TO", "REQUEST_TYPE", "CRIME_CATEGORY"] as const;
const REGIONS = ["SPR", "SCPR", "NCPR", "NPR", "UNPR"] as const;

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "MAIN_ADMIN") {
      return NextResponse.json(
        { error: "Only Main Admin can manage options." },
        { status: 403 }
      );
    }

    const body = await req.json();

    const type = String(body.type || "").trim();
    const name = String(body.name || "").trim();
    const region = String(body.region || "").trim();

    if (!OPTION_TYPES.includes(type as any)) {
      return NextResponse.json(
        { error: "Invalid option type." },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: "Option name is required." },
        { status: 400 }
      );
    }

    if (type === "SHARED_TO") {
      const option = await prisma.sharedToOption.upsert({
        where: { name },
        update: { isActive: true },
        create: {
          name,
          isActive: true,
        },
      });

      return NextResponse.json({ success: true, option });
    }

    if (type === "REQUEST_TYPE") {
      const option = await prisma.requestTypeOption.upsert({
        where: { name },
        update: { isActive: true },
        create: {
          name,
          isActive: true,
        },
      });

      return NextResponse.json({ success: true, option });
    }

    if (!REGIONS.includes(region as any)) {
      return NextResponse.json(
        { error: "Please select a valid region." },
        { status: 400 }
      );
    }

    const existingCategory = await prisma.crimeCategory.findFirst({
      where: {
        name,
        region: region as any,
      },
    });

    if (existingCategory) {
      const option = await prisma.crimeCategory.update({
        where: {
          id: existingCategory.id,
        },
        data: {
          isActive: true,
        },
      });

      return NextResponse.json({ success: true, option });
    }

    const option = await prisma.crimeCategory.create({
      data: {
        name,
        region: region as any,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, option });
  } catch (error) {
    console.error("CREATE_OPTION_ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong while creating option." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "MAIN_ADMIN") {
      return NextResponse.json(
        { error: "Only Main Admin can manage options." },
        { status: 403 }
      );
    }

    const body = await req.json();

    const type = String(body.type || "").trim();
    const id = String(body.id || "").trim();
    const isActive = Boolean(body.isActive);

    if (!OPTION_TYPES.includes(type as any)) {
      return NextResponse.json(
        { error: "Invalid option type." },
        { status: 400 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { error: "Option ID is required." },
        { status: 400 }
      );
    }

    if (type === "SHARED_TO") {
      const option = await prisma.sharedToOption.update({
        where: { id },
        data: { isActive },
      });

      return NextResponse.json({ success: true, option });
    }

    if (type === "REQUEST_TYPE") {
      const option = await prisma.requestTypeOption.update({
        where: { id },
        data: { isActive },
      });

      return NextResponse.json({ success: true, option });
    }

    const option = await prisma.crimeCategory.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json({ success: true, option });
  } catch (error) {
    console.error("UPDATE_OPTION_STATUS_ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong while updating option." },
      { status: 500 }
    );
  }
}