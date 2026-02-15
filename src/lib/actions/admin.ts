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

function formatDate(date: Date): string {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const d = new Date(date);
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
