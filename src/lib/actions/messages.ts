"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type MessageRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
};

// ─── Auth guard ────────────────────────────────────────────────────────────────

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || (session.user as any).role !== "admin") {
    throw new Error("Unauthorized");
  }
  return session;
}

// ─── Queries ───────────────────────────────────────────────────────────────────

export async function getMessages(opts?: {
  search?: string;
  unreadOnly?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<{ messages: MessageRow[]; total: number; unreadCount: number }> {
  await requireAdmin();

  const page = opts?.page ?? 1;
  const pageSize = opts?.pageSize ?? 20;
  const skip = (page - 1) * pageSize;

  const where = {
    ...(opts?.unreadOnly ? { isRead: false } : {}),
    ...(opts?.search
      ? {
          OR: [
            { name: { contains: opts.search, mode: "insensitive" as const } },
            { email: { contains: opts.search, mode: "insensitive" as const } },
            { subject: { contains: opts.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [messages, total, unreadCount] = await Promise.all([
    prisma.contactMessage.findMany({
      where,
      orderBy: [{ isRead: "asc" }, { createdAt: "desc" }],
      skip,
      take: pageSize,
    }),
    prisma.contactMessage.count({ where }),
    prisma.contactMessage.count({ where: { isRead: false } }),
  ]);

  return { messages, total, unreadCount };
}

export async function getMessage(id: string): Promise<MessageRow | null> {
  await requireAdmin();

  const msg = await prisma.contactMessage.findUnique({ where: { id } });
  if (!msg) return null;

  if (!msg.isRead) {
    await prisma.contactMessage.update({
      where: { id },
      data: { isRead: true },
    });
    revalidatePath("/admin/messages");
  }

  return { ...msg, isRead: true };
}

export async function getUnreadMessageCount(): Promise<number> {
  await requireAdmin();
  return prisma.contactMessage.count({ where: { isRead: false } });
}

export async function deleteMessage(id: string): Promise<void> {
  await requireAdmin();
  await prisma.contactMessage.delete({ where: { id } });
  revalidatePath("/admin/messages");
}
