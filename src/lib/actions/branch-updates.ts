"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/actions/activity";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type AdminBranchUpdateRow = {
  id: string;
  title: string;
  content: string;
  branchId: number;
  branchName: string;
  structureName: string;
  authorName: string;
  createdAt: Date;
};

export type MemberBranchUpdate = {
  id: string;
  title: string;
  content: string;
  branchName: string;
  structureName: string;
  authorName: string;
  createdAt: Date;
};

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

export async function getAllBranchUpdatesAdmin(): Promise<AdminBranchUpdateRow[]> {
  await requireAdmin();

  const updates = await prisma.branchUpdate.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      branch: { include: { structure: true } },
      author: { select: { name: true } },
    },
  });

  return updates.map((u) => ({
    id: u.id,
    title: u.title,
    content: u.content,
    branchId: u.branchId,
    branchName: u.branch.name,
    structureName: u.branch.structure.name,
    authorName: u.author.name,
    createdAt: u.createdAt,
  }));
}

// ─── Admin: Write ──────────────────────────────────────────────────────────────

export async function createBranchUpdate(data: {
  title: string;
  content: string;
  branchId: number;
}): Promise<void> {
  const session = await requireAdmin();

  if (!data.title.trim() || !data.content.trim()) {
    throw new Error("Title and content are required");
  }

  await prisma.branchUpdate.create({
    data: {
      title: data.title.trim(),
      content: data.content.trim(),
      branchId: data.branchId,
      authorId: session.user.id,
    },
  });

  // Notify all members of this branch (excluding the poster, excluding soft-deleted)
  const branchMembers = await prisma.member.findMany({
    where: {
      branchId: data.branchId,
      userId: { not: session.user.id },
      deletedAt: null,
    },
    select: { userId: true },
  });

  if (branchMembers.length > 0) {
    await prisma.notification.createMany({
      data: branchMembers.map((m) => ({
        userId: m.userId,
        type: "BRANCH_UPDATE" as const,
        message: `New branch update: "${data.title.trim()}"`,
        postSlug: null,
        postTitle: null,
        isRead: false,
      })),
    });
  }

  await logActivity({
    userId: session.user.id,
    type: "BRANCH",
    action: `posted branch update: "${data.title.trim()}"`,
    metadata: { branchId: data.branchId },
  });

  revalidatePath("/admin/branch-updates");
}

export async function deleteBranchUpdate(id: string): Promise<void> {
  const session = await requireAdmin();

  const update = await prisma.branchUpdate.findUnique({
    where: { id },
    select: { title: true },
  });

  await prisma.branchUpdate.delete({ where: { id } });

  await logActivity({
    userId: session.user.id,
    type: "BRANCH",
    action: `deleted branch update: "${update?.title ?? id}"`,
    metadata: { updateId: id },
  });

  revalidatePath("/admin/branch-updates");
}

// ─── Member: Read ──────────────────────────────────────────────────────────────

export async function getUpdatesForMember(): Promise<MemberBranchUpdate[]> {
  const session = await requireSession();

  const member = await prisma.member.findUnique({
    where: { userId: session.user.id },
    select: { branchId: true },
  });

  if (!member?.branchId) return [];

  const updates = await prisma.branchUpdate.findMany({
    where: { branchId: member.branchId },
    orderBy: { createdAt: "desc" },
    include: {
      branch: { include: { structure: true } },
      author: { select: { name: true } },
    },
  });

  return updates.map((u) => ({
    id: u.id,
    title: u.title,
    content: u.content,
    branchName: u.branch.name,
    structureName: u.branch.structure.name,
    authorName: u.author.name,
    createdAt: u.createdAt,
  }));
}
