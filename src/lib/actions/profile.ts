"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { logActivity } from "@/lib/actions/activity";
import { generateMemberId } from "@/lib/member-id";

const completionFields = [
    "title", "firstName", "lastName", "gender", "identityNumber",
    "dateOfBirth", "contactNumber", "countryName", "streetAddress",
    "city", "homeArea", "employment"
];

export async function calculateCompletion(member: any) {
    if (!member) return 0;
    let count = 0;
    completionFields.forEach(field => {
        if (member[field]) count++;
    });
    if (member.branchId) count++;

    return Math.round((count / (completionFields.length + 1)) * 100);
}

export async function updateProfile(formData: any) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || !session.user) {
        throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    // Convert date string to Date object, treat empty string as null
    formData.dateOfBirth = formData.dateOfBirth
        ? new Date(formData.dateOfBirth)
        : null;

    // Handle branch lookup
    let branchId = null;
    if (formData.branch) {
        const branch = await prisma.branch.findFirst({
            where: { name: formData.branch },
        });
        if (branch) branchId = branch.id;
    }

    // Prepare data for Prisma
    const profileData = {
        title: formData.title,
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender,
        identityNumber: formData.identityNumber,
        dateOfBirth: formData.dateOfBirth,
        contactNumber: formData.contactNumber,
        countryName: formData.countryName,
        streetAddress: formData.streetAddress,
        city: formData.city,
        homeArea: formData.homeArea,
        postalCode: formData.postalCode,
        employment: formData.employment,
        companyName: formData.companyName,
        avatarUrl: formData.avatarUrl,
        branchId: branchId,
    };

    // Upsert Member record
    let member = await prisma.member.upsert({
        where: { userId },
        update: profileData,
        create: {
            ...profileData,
            userId,
        }
    });

    // Check completion
    const completion = await calculateCompletion(member);

    // Backfill: if member still has a raw CUID (pre-migration), assign proper ID
    if (!member.membershipNumber.startsWith("PU-")) {
        const membershipNumber = await generateMemberId();
        member = await prisma.member.update({
            where: { id: member.id },
            data: { membershipNumber },
        });
    }

    // Log activity
    await logActivity({
        userId,
        type: "PROFILE",
        action: "updated their profile",
    });

    return {
        success: true,
        member,
        completion
    };
}

export async function getMemberProfile() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || !session.user) return null;

    const member = await prisma.member.findUnique({
        where: { userId: session.user.id },
        include: {
            user: {
                select: { image: true, name: true }
            },
            branch: {
                include: {
                    structure: true
                }
            }
        }
    });

    const completion = member ? await calculateCompletion(member) : 0;

    if (!member) {
        return {
            id: "",
            userId: session.user.id,
            membershipNumber: "Pending",
            title: "",
            firstName: session.user.name?.split(" ")[0] || "User",
            lastName: session.user.name?.split(" ").slice(1).join(" ") || "",
            gender: "",
            identityNumber: "",
            dateOfBirth: null,
            contactNumber: "",
            countryName: "Eswatini",
            streetAddress: "",
            city: "",
            homeArea: "",
            postalCode: "",
            employment: "No",
            companyName: "",
            avatarUrl: session.user.image, // Fallback to social image
            completion: 0,
            structure: "",
            branchName: "",
            user: { image: session.user.image, name: session.user.name },
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    return {
        ...member,
        avatarUrl: member.avatarUrl || member.user.image, // Fallback to social image
        completion,
        structure: member.branch?.structure?.name || "",
        branchName: member.branch?.name || ""
    };
}

// ─── Account Deletion ──────────────────────────────────────────────────────────

export async function deleteMyAccount(): Promise<{ success: boolean }> {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) throw new Error("Unauthorized");

    const userId = session.user.id;

    await prisma.$transaction(async (tx) => {
        // Member record first (FK references)
        await tx.member.deleteMany({ where: { userId } });
        // User deletion cascades: Session, Account, Comment, Post, Notification
        // ActivityLog uses SetNull so audit records are preserved
        await tx.user.delete({ where: { id: userId } });
    });

    return { success: true };
}
