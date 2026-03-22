"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export type NotificationRow = {
  id: string;
  type: string;
  message: string;
  postSlug: string | null;
  postTitle: string | null;
  isRead: boolean;
  createdAt: Date;
};

export async function getUnreadCount(): Promise<number> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return 0;

  return prisma.notification.count({
    where: { userId: session.user.id, isRead: false },
  });
}

export async function getRecentNotifications(): Promise<NotificationRow[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return [];

  return prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 15,
    select: {
      id: true,
      type: true,
      message: true,
      postSlug: true,
      postTitle: true,
      isRead: true,
      createdAt: true,
    },
  });
}

export async function markAllRead(): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return;

  await prisma.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true },
  });
}
