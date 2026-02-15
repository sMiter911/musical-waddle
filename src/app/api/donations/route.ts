import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const data = await req.json();
    const donation = await prisma.donation.create({
        data: {
            name: data.name,
            email: data.email,
            amount: parseFloat(data.amount),
            message: data.message,
        }
    });
    return NextResponse.json(donation);
}
