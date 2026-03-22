"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/actions/activity";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type AdminResourceRow = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  category: string;
  authorName: string;
  createdAt: Date;
};

export type MemberResourceRow = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  category: string;
  createdAt: Date;
};

const RESOURCE_CATEGORIES_LIST = [
  "General",
  "Education",
  "Legal",
  "Political",
  "Financial",
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || (session.user as any).role !== "admin") {
    throw new Error("Unauthorized");
  }
  return session;
}

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");
  return session;
}

// ─── Admin: Read ───────────────────────────────────────────────────────────────

export async function getAllResourcesAdmin(): Promise<AdminResourceRow[]> {
  await requireAdmin();

  const resources = await prisma.resource.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  return resources.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    url: r.url,
    category: r.category,
    authorName: r.author.name,
    createdAt: r.createdAt,
  }));
}

// ─── Admin: Write ──────────────────────────────────────────────────────────────

export async function createResource(data: {
  title: string;
  description?: string;
  url: string;
  category: string;
}): Promise<void> {
  const session = await requireAdmin();

  if (!data.title.trim() || !data.url.trim()) {
    throw new Error("Title and URL are required");
  }

  await prisma.resource.create({
    data: {
      title: data.title.trim(),
      description: data.description?.trim() || null,
      url: data.url.trim(),
      category: data.category || "General",
      authorId: session.user.id,
    },
  });

  await logActivity({
    userId: session.user.id,
    type: "RESOURCE",
    action: `added resource: "${data.title.trim()}"`,
    metadata: { category: data.category },
  });

  revalidatePath("/admin/resources");
}

export async function deleteResource(id: string): Promise<void> {
  const session = await requireAdmin();

  const resource = await prisma.resource.findUnique({
    where: { id },
    select: { title: true },
  });

  await prisma.resource.delete({ where: { id } });

  await logActivity({
    userId: session.user.id,
    type: "RESOURCE",
    action: `deleted resource: "${resource?.title ?? id}"`,
    metadata: { resourceId: id },
  });

  revalidatePath("/admin/resources");
}

// ─── Member: Read ──────────────────────────────────────────────────────────────

const COMPLETION_FIELDS = [
  "title", "firstName", "lastName", "gender", "identityNumber",
  "dateOfBirth", "contactNumber", "countryName", "streetAddress",
  "city", "homeArea", "employment",
] as const;

export async function getResourcesForMember(): Promise<MemberResourceRow[]> {
  const session = await requireSession();

  const member = await prisma.member.findUnique({
    where: { userId: session.user.id },
    select: {
      title: true, firstName: true, lastName: true, gender: true,
      identityNumber: true, dateOfBirth: true, contactNumber: true,
      countryName: true, streetAddress: true, city: true, homeArea: true,
      employment: true, branchId: true,
    },
  });

  if (!member) throw new Error("INCOMPLETE_PROFILE");

  let filled = 0;
  COMPLETION_FIELDS.forEach((f) => { if (member[f]) filled++; });
  if (member.branchId) filled++;
  const completion = Math.round((filled / (COMPLETION_FIELDS.length + 1)) * 100);

  if (completion < 100) throw new Error("INCOMPLETE_PROFILE");

  const resources = await prisma.resource.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, description: true, url: true, category: true, createdAt: true },
  });

  return resources;
}
