import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const REGIONS = ["SPR", "SCPR", "NCPR", "NPR", "UNPR"] as const;
const ROLES = ["MAIN_ADMIN", "STAFF"] as const;

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "MAIN_ADMIN") {
      return NextResponse.json(
        { error: "Only main admin can create users." },
        { status: 403 }
      );
    }

    const body = await req.json();

    const fullName = String(body.fullName || "").trim();
    const serviceNumber = String(body.serviceNumber || "").trim();
    const mobileNumber = String(body.mobileNumber || "").trim();
    const username = String(body.username || "").trim().toLowerCase();
    const password = String(body.password || "");
    const rank = String(body.rank || "").trim();
    const region = String(body.region || "").trim();
    const role = String(body.role || "STAFF").trim();

    if (!fullName || !serviceNumber || !username || !password || !role) {
      return NextResponse.json(
        { error: "Required fields are missing." },
        { status: 400 }
      );
    }

    if (!ROLES.includes(role as any)) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }

    if (role === "STAFF" && !REGIONS.includes(region as any)) {
      return NextResponse.json(
        { error: "Staff must have a valid region." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { serviceNumber }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Username or service number already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName,
        serviceNumber,
        mobileNumber: mobileNumber || null,
        username,
        passwordHash,
        rank: rank || null,
        region: role === "MAIN_ADMIN" ? null : (region as any),
        role: role as any,
        isActive: true,
        mustChangePassword: true,
      },
      select: {
        id: true,
        fullName: true,
        serviceNumber: true,
        mobileNumber: true,
        username: true,
        rank: true,
        region: true,
        role: true,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong while creating user." },
      { status: 500 }
    );
  }
}