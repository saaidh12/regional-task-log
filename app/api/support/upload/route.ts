import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please login again." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file uploaded." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, WEBP and PDF files are allowed." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size must be 10MB or less." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadRoot =
      process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");

    const uploadDir = path.join(uploadRoot, "support");

    await mkdir(uploadDir, { recursive: true });

    const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const ext = path.extname(originalName) || ".jpg";
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}${ext}`;

    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      attachment: {
        fileUrl: `/uploads/support/${fileName}`,
        fileName: originalName,
        fileType: file.type,
        fileSize: file.size,
      },
    });
  } catch (error) {
    console.error("SUPPORT_UPLOAD_ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong while uploading file." },
      { status: 500 }
    );
  }
}