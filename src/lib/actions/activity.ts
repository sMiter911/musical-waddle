"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ActivityType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

// ─── Types ─────────────────────────────────────────────────────────────────────
export type ActivityItem = {
  id: string;
  user: string;
  action: string;
  type: "member" | "profile" | "donation" | "post" | "branch" | "resource";
  time: string;
};

export type ActivityFilter = {
  userId?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
};

export type ActivityItemFull = {
  id: string;
  userId: string | null;
  user: string | null;
  userEmail: string | null;
  action: string;
  type: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  timeAgo: string;
};

export type ActivityPageResult = {
  items: ActivityItemFull[];
  total: number;
  totalPages: number;
  page: number;
};

type LogActivityInput = {
  userId?: string;
  type: ActivityType;
  action: string;
  metadata?: Record<string, unknown>;
};

// ─── Write ─────────────────────────────────────────────────────────────────────
/**
 * Call this inside any server action when a notable event occurs.
 * userId is optional — pass it when a specific user triggered the event.
 *
 * @example
 * await logActivity({ userId, type: "MEMBER", action: "signed up as a new member" });
 */
export async function logActivity(input: LogActivityInput): Promise<void> {
  await prisma.activityLog.create({
    data: {
      userId: input.userId,
      type: input.type,
      action: input.action,
      metadata: input.metadata as any,
    },
  });

  revalidatePath("/admin");
}

// ─── Read ──────────────────────────────────────────────────────────────────────
/**
 * Fetch the most recent N activity events for the admin dashboard.
 * Returns a typed array ready to pass directly into the ActivityFeed component.
 *
 * @param limit - number of events to return (default 10)
 */
export async function getRecentActivity(
  limit = 10
): Promise<ActivityItem[]> {
  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
  });

  return logs.map((log) => ({
    id: log.id,
    user: log.user?.name ?? log.user?.email ?? "System",
    action: log.action,
    type: log.type.toLowerCase() as ActivityItem["type"],
    time: formatRelativeTime(log.createdAt),
  }));
}

// ─── Paginated Audit Feed ──────────────────────────────────────────────────────

export async function getActivityPage(
  filter: ActivityFilter
): Promise<ActivityPageResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || (session.user as any).role !== "admin") {
    throw new Error("Unauthorized");
  }

  const page = filter.page ?? 1;
  const pageSize = filter.pageSize ?? 25;

  const where: any = {};

  if (filter.userId) {
    where.userId = filter.userId;
  }

  if (filter.type && filter.type !== "all") {
    const typeKey = filter.type.toUpperCase();
    if (typeKey in ActivityType) {
      where.type = ActivityType[typeKey as keyof typeof ActivityType];
    }
  }

  if (filter.dateFrom || filter.dateTo) {
    where.createdAt = {};
    if (filter.dateFrom) where.createdAt.gte = new Date(filter.dateFrom);
    if (filter.dateTo) {
      const to = new Date(filter.dateTo);
      to.setHours(23, 59, 59, 999);
      where.createdAt.lte = to;
    }
  }

  const [total, logs] = await Promise.all([
    prisma.activityLog.count({ where }),
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
  ]);

  return {
    items: logs.map((log) => ({
      id: log.id,
      userId: log.userId,
      user: log.user?.name ?? null,
      userEmail: log.user?.email ?? null,
      action: log.action,
      type: log.type.toLowerCase(),
      metadata: log.metadata as Record<string, unknown> | null,
      createdAt: log.createdAt,
      timeAgo: formatRelativeTime(log.createdAt),
    })),
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    page,
  };
}

export async function getAllUsersForFilter(): Promise<
  { id: string; name: string; email: string }[]
> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || (session.user as any).role !== "admin") {
    throw new Error("Unauthorized");
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  return users;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}
