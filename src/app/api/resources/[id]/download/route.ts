import { prisma } from "@/lib/db";
import { generateDownloadUrl } from "@/lib/storage";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const resource = await prisma.resource.findUnique({
    where: { id },
    select: { fileUrl: true, isPublished: true },
  });

  if (!resource || !resource.isPublished) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const url = await generateDownloadUrl(resource.fileUrl);
    return NextResponse.redirect(url);
  } catch {
    return NextResponse.json({ error: "Could not generate download URL" }, { status: 500 });
  }
}
