"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { logActivity } from "@/lib/actions/activity";

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

function generateMemberId() {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `PU-${year}-${random}`;
}

export async function updateProfile(formData: any) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || !session.user) {
        throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    // Convert date string to Date object
    if (formData.dateOfBirth) {
        formData.dateOfBirth = new Date(formData.dateOfBirth);
    }

    // Handle branch lookup
    let branchId = null;
    if (formData.branch) {
        const branch = await prisma.branch.findFirst({
            where: { name: formData.branch }
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

    // If 100% and still has a default CUID as membershipNumber (starts with c)
    if (completion === 100 && member.membershipNumber.startsWith("c")) {
        member = await prisma.member.update({
            where: { id: member.id },
            data: {
                membershipNumber: generateMemberId()
            }
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
        completion,
        structure: member.branch?.structure?.name || "",
        branchName: member.branch?.name || ""
    };
}
