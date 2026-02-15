"use server";

import { prisma } from "@/lib/db";
import { ActivityType } from "@prisma/client";
import { revalidatePath } from "next/cache";

// ─── Types ─────────────────────────────────────────────────────────────────────
export type ActivityItem = {
  id: string;
  user: string;
  action: string;
  type: "member" | "profile" | "donation" | "post";
  time: string;
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
      metadata: input.metadata,
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
