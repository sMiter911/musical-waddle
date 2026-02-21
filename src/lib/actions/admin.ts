"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getAllMembers() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user || (session.user as any).role !== "admin") {
    throw new Error("Unauthorized");
  }

  const members = await prisma.member.findMany({
    include: {
      user: {
        select: {
          email: true,
          createdAt: true,
        },
      },
      branch: {
        include: {
          structure: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return members.map((member) => ({
    id: member.membershipNumber,
    userId: member.userId,
    name: `${member.firstName} ${member.lastName}`.trim() || "Unknown",
    email: member.user.email,
    region: member.branch?.structure?.name || "Not assigned",
    branch: member.branch?.name || "Not assigned",
    status: determineStatus(member),
    joined: formatDate(member.user.createdAt),
    rawDate: member.user.createdAt,
  }));
}

export async function getMemberStats() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user || (session.user as any).role !== "admin") {
    throw new Error("Unauthorized");
  }

  const totalMembers = await prisma.member.count();
  const totalUsers = await prisma.user.count();
  const totalDonations = await prisma.donation.count();
  const totalVolunteers = await prisma.volunteer.count();

  // Get members with complete profiles
  const members = await prisma.member.findMany({
    select: {
      title: true,
      firstName: true,
      lastName: true,
      gender: true,
      identityNumber: true,
      dateOfBirth: true,
      contactNumber: true,
      countryName: true,
      streetAddress: true,
      city: true,
      homeArea: true,
      employment: true,
      branchId: true,
    },
  });

  const completionFields = [
    "title",
    "firstName",
    "lastName",
    "gender",
    "identityNumber",
    "dateOfBirth",
    "contactNumber",
    "countryName",
    "streetAddress",
    "city",
    "homeArea",
    "employment",
  ];

  let activeCount = 0;
  let pendingCount = 0;

  members.forEach((member) => {
    let filledFields = 0;
    completionFields.forEach((field) => {
      if (member[field as keyof typeof member]) filledFields++;
    });
    if (member.branchId) filledFields++;

    const completion = Math.round(
      (filledFields / (completionFields.length + 1)) * 100
    );

    if (completion === 100) {
      activeCount++;
    } else {
      pendingCount++;
    }
  });

  const inactiveCount = totalMembers - activeCount - pendingCount;

  return {
    totalMembers,
    totalUsers,
    totalDonations,
    totalVolunteers,
    activeMembers: activeCount,
    pendingMembers: pendingCount,
    inactiveMembers: Math.max(0, inactiveCount),
  };
}

function determineStatus(member: any): "Active" | "Pending" | "Inactive" {
  const completionFields = [
    "title",
    "firstName",
    "lastName",
    "gender",
    "identityNumber",
    "dateOfBirth",
    "contactNumber",
    "countryName",
    "streetAddress",
    "city",
    "homeArea",
    "employment",
  ];

  let filledFields = 0;
  completionFields.forEach((field) => {
    if (member[field]) filledFields++;
  });
  if (member.branchId) filledFields++;

  const completion = Math.round(
    (filledFields / (completionFields.length + 1)) * 100
  );

  if (completion === 100) return "Active";
  if (completion >= 50) return "Pending";
  return "Inactive";
}

export async function getMemberProfileById(userId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user || (session.user as any).role !== "admin") {
    throw new Error("Unauthorized");
  }

  const member = await prisma.member.findUnique({
    where: { userId },
    include: {
      user: {
        select: { image: true, email: true, name: true }
      },
      branch: {
        include: {
          structure: true
        }
      }
    }
  });

  if (!member) return null;

  const completion = await calculateCompletion(member);

  return {
    ...member,
    avatarUrl: member.avatarUrl || member.user.image,
    completion,
    structure: member.branch?.structure?.name || "",
    branchName: member.branch?.name || ""
  };
}

async function calculateCompletion(member: any) {
  const completionFields = [
    "title",
    "firstName",
    "lastName",
    "gender",
    "identityNumber",
    "dateOfBirth",
    "contactNumber",
    "countryName",
    "streetAddress",
    "city",
    "homeArea",
    "employment",
  ];

  let filledFields = 0;
  completionFields.forEach((field) => {
    if (member[field as keyof typeof member]) filledFields++;
  });
  if (member.branchId) filledFields++;

  return Math.round((filledFields / (completionFields.length + 1)) * 100);
}

export async function getMemberActivityById(userId: string, limit = 20) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user || (session.user as any).role !== "admin") {
    throw new Error("Unauthorized");
  }

  const logs = await prisma.activityLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return logs.map((log) => ({
    id: log.id,
    action: log.action,
    type: log.type.toLowerCase(),
    time: formatRelativeTime(log.createdAt),
    fullDate: log.createdAt,
  }));
}

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

function formatDate(date: Date): string {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const d = new Date(date);
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

