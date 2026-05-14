"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/actions/activity";
import { getStorageAdapter } from "@/lib/storage";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type AdminResourceRow = {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileType: string | null;
  fileSize: number | null;
  category: string;
  isPublished: boolean;
  slug: string | null;
  tags: string[];
  authorName: string;
  createdAt: Date;
};

export type PublicResourceRow = {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileType: string | null;
  fileSize: number | null;
  category: string;
  slug: string | null;
  tags: string[];
  createdAt: Date;
};

export type MemberResourceRow = PublicResourceRow;

// ─── Auth guards ───────────────────────────────────────────────────────────────

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

// ─── Admin: List ───────────────────────────────────────────────────────────────

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
    fileUrl: r.fileUrl,
    fileType: r.fileType,
    fileSize: r.fileSize,
    category: r.category,
    isPublished: r.isPublished,
    slug: r.slug,
    tags: r.tags,
    authorName: r.author.name,
    createdAt: r.createdAt,
  }));
}

// ─── Admin: Create ────────────────────────────────────────────────────────────

export async function createResource(data: {
  title: string;
  description?: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  category?: string;
  isPublished?: boolean;
  tags?: string[];
}): Promise<void> {
  const session = await requireAdmin();

  if (!data.title.trim() || !data.fileUrl.trim()) {
    throw new Error("Title and file URL are required");
  }

  const slug = await buildUniqueSlug(data.title);

  await prisma.resource.create({
    data: {
      title:       data.title.trim(),
      description: data.description?.trim() || null,
      fileUrl:     data.fileUrl.trim(),
      fileType:    data.fileType ?? null,
      fileSize:    data.fileSize ?? null,
      category:    data.category || "General",
      isPublished: data.isPublished ?? true,
      slug,
      tags:        data.tags ?? [],
      authorId:    session.user.id,
    },
  });

  await logActivity({
    userId: session.user.id,
    type: "RESOURCE",
    action: `added resource: "${data.title.trim()}"`,
    metadata: { category: data.category },
  });

  revalidatePath("/admin/resources");
  revalidatePath("/resources");
}

// ─── Admin: Update ────────────────────────────────────────────────────────────

export async function updateResource(
  id: string,
  data: {
    title?: string;
    description?: string;
    fileUrl?: string;
    fileType?: string;
    fileSize?: number;
    category?: string;
    isPublished?: boolean;
    tags?: string[];
  }
): Promise<void> {
  const session = await requireAdmin();

  const existing = await prisma.resource.findUnique({ where: { id }, select: { title: true, slug: true } });
  if (!existing) throw new Error("Resource not found");

  const needsNewSlug = data.title && data.title.trim() !== existing.title;
  const slug = needsNewSlug ? await buildUniqueSlug(data.title!, id) : undefined;

  await prisma.resource.update({
    where: { id },
    data: {
      ...(data.title       ? { title: data.title.trim() }         : {}),
      ...(data.description !== undefined ? { description: data.description?.trim() || null } : {}),
      ...(data.fileUrl     ? { fileUrl: data.fileUrl.trim() }     : {}),
      ...(data.fileType    !== undefined ? { fileType: data.fileType ?? null }               : {}),
      ...(data.fileSize    !== undefined ? { fileSize: data.fileSize ?? null }               : {}),
      ...(data.category    ? { category: data.category }          : {}),
      ...(data.isPublished !== undefined ? { isPublished: data.isPublished }                 : {}),
      ...(data.tags        ? { tags: data.tags }                  : {}),
      ...(slug             ? { slug }                             : {}),
    },
  });

  await logActivity({
    userId: session.user.id,
    type: "RESOURCE",
    action: `updated resource: "${existing.title}"`,
  });

  revalidatePath("/admin/resources");
  revalidatePath("/resources");
}

// ─── Admin: Toggle publish ────────────────────────────────────────────────────

export async function togglePublishResource(id: string): Promise<boolean> {
  const session = await requireAdmin();

  const resource = await prisma.resource.findUnique({
    where: { id },
    select: { isPublished: true, title: true },
  });
  if (!resource) throw new Error("Resource not found");

  const next = !resource.isPublished;
  await prisma.resource.update({ where: { id }, data: { isPublished: next } });

  await logActivity({
    userId: session.user.id,
    type: "RESOURCE",
    action: `${next ? "published" : "unpublished"} resource: "${resource.title}"`,
  });

  revalidatePath("/admin/resources");
  revalidatePath("/resources");
  return next;
}

// ─── Admin: Delete ────────────────────────────────────────────────────────────

export async function deleteResource(id: string): Promise<void> {
  const session = await requireAdmin();

  const resource = await prisma.resource.findUnique({
    where: { id },
    select: { title: true, fileUrl: true },
  });

  await prisma.resource.delete({ where: { id } });

  // Clean up local file if stored locally
  if (resource?.fileUrl?.startsWith("/uploads/")) {
    try {
      const adapter = await getStorageAdapter();
      await adapter.delete(resource.fileUrl);
    } catch { /* non-fatal */ }
  }

  await logActivity({
    userId: session.user.id,
    type: "RESOURCE",
    action: `deleted resource: "${resource?.title ?? id}"`,
  });

  revalidatePath("/admin/resources");
  revalidatePath("/resources");
}

// ─── Public ───────────────────────────────────────────────────────────────────

export async function getPublicResources(opts?: {
  search?: string;
  category?: string;
}): Promise<PublicResourceRow[]> {
  const where = {
    isPublished: true,
    ...(opts?.category && opts.category !== "All" ? { category: opts.category } : {}),
    ...(opts?.search
      ? {
          OR: [
            { title:       { contains: opts.search, mode: "insensitive" as const } },
            { description: { contains: opts.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const resources = await prisma.resource.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, description: true,
      fileUrl: true, fileType: true, fileSize: true,
      category: true, slug: true, tags: true, createdAt: true,
    },
  });

  return resources;
}

// ─── Member (profile-gated) ───────────────────────────────────────────────────

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

  return prisma.resource.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, description: true,
      fileUrl: true, fileType: true, fileSize: true,
      category: true, slug: true, tags: true, createdAt: true,
    },
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function buildUniqueSlug(title: string, excludeId?: string): Promise<string> {
  const { generateSlug } = await import("@/lib/slugify");
  const base = generateSlug(title);
  let slug = base;
  let n = 1;

  while (true) {
    const existing = await prisma.resource.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) break;
    slug = `${base}-${n++}`;
  }

  return slug;
}
