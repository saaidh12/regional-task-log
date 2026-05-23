import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const REGIONS = ["SPR", "SCPR", "NCPR", "NPR", "UNPR"] as const;

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

    const existingPerson = await prisma.personRecord.findUnique({
      where: { id },
    });

    if (!existingPerson) {
      return NextResponse.json(
        { error: "Person record not found." },
        { status: 404 }
      );
    }

    if (session.role !== "MAIN_ADMIN" && existingPerson.region !== session.region) {
      return NextResponse.json(
        { error: "You cannot edit another region's database record." },
        { status: 403 }
      );
    }

    const body = await req.json();

    const photoUrl = String(body.photoUrl || "").trim();
    const fullName = String(body.fullName || "").trim();

    const idNumber = String(body.idNumber || "")
      .trim()
      .toUpperCase();

    const address = String(body.address || "").trim();
    const mobileNumber = String(body.mobileNumber || "").trim();
    const regionFromBody = String(body.region || "").trim();
    const atoll = String(body.atoll || "").trim();
    const island = String(body.island || "").trim();
    const notes = String(body.notes || "").trim();

    const nicknames: string[] = Array.isArray(body.nicknames)
      ? body.nicknames
          .map((item: unknown) => String(item).trim())
          .filter((item: string) => item.length > 0)
      : [];

    const crimeCategoryIds: string[] = Array.isArray(body.crimeCategoryIds)
      ? body.crimeCategoryIds
          .map((item: unknown) => String(item).trim())
          .filter((item: string) => item.length > 0)
      : [];

    const region =
      session.role === "MAIN_ADMIN" ? regionFromBody : existingPerson.region;

    if (!fullName || !region) {
      return NextResponse.json(
        { error: "Please fill name and region." },
        { status: 400 }
      );
    }

    if (idNumber && !/^[A-Z]\d{6}$/.test(idNumber)) {
      return NextResponse.json(
        { error: "ID number must be in this format: A000000" },
        { status: 400 }
      );
    }

    if (!REGIONS.includes(region as any)) {
      return NextResponse.json(
        { error: "Invalid region selected." },
        { status: 400 }
      );
    }

    const allowedCategories = await prisma.crimeCategory.findMany({
      where: {
        id: {
          in: crimeCategoryIds,
        },
        region: region as any,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    const allowedCategoryIds = allowedCategories.map((item) => item.id);

    await prisma.personNickname.deleteMany({
      where: { personId: id },
    });

    await prisma.personCrimeCategory.deleteMany({
      where: { personId: id },
    });

    const person = await prisma.personRecord.update({
      where: { id },
      data: {
        photoUrl: photoUrl || null,
        fullName,
        idNumber: idNumber || null,
        address: address || null,
        mobileNumber: mobileNumber || null,
        region: region as any,
        atoll: atoll || null,
        island: island || null,
        notes: notes || null,

        nicknames: {
          create: nicknames.map((name: string) => ({
            name,
          })),
        },

        crimeCategories: {
          create: allowedCategoryIds.map((crimeCategoryId: string) => ({
            crimeCategory: {
              connect: {
                id: crimeCategoryId,
              },
            },
          })),
        },
      },
    });

    return NextResponse.json({ success: true, person });
  } catch (error) {
    console.error("UPDATE_PERSON_ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong while updating person record." },
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
        { error: "Only Main Admin can delete person records." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existingPerson = await prisma.personRecord.findUnique({
      where: { id },
    });

    if (!existingPerson) {
      return NextResponse.json(
        { error: "Person record not found." },
        { status: 404 }
      );
    }

    await prisma.personRecord.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Person record deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE_PERSON_ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong while deleting person record." },
      { status: 500 }
    );
  }
}